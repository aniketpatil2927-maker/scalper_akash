import { Response } from 'express';
import https from 'https';
import { z } from 'zod';
import { TelegramPost, SystemSetting, User, Subscription, Notification, Plan } from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

/**
 * Ultra-reliable native HTTPS Telegram API caller.
 * Forces family: 4 (IPv4) to avoid Windows / Node dual-stack connect timeouts.
 */
export function telegramApiCall<T = any>(
  botToken: string,
  method: string,
  payload?: any
): Promise<TelegramApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const isPost = Boolean(payload);
    const bodyString = isPost ? JSON.stringify(payload) : null;
    const options: https.RequestOptions = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/${method}`,
      method: isPost ? 'POST' : 'GET',
      family: 4, // Strictly force IPv4
      headers: {
        'Content-Type': 'application/json',
        ...(bodyString ? { 'Content-Length': Buffer.byteLength(bodyString) } : {}),
      },
      timeout: 12000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ ok: false, description: data || 'Non-JSON response from Telegram' });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Telegram API connection timeout (IPv4)'));
    });

    if (bodyString) {
      req.write(bodyString);
    }
    req.end();
  });
}

function normalizeChannel(ch: string | null | undefined, fallback: string): string {
  if (!ch || !ch.trim()) return fallback;
  let c = ch.trim();
  if (c.toLowerCase() === 'akashpatil_03bot' || c.toLowerCase() === '@akashpatil_03bot') {
    return fallback;
  }
  if (c.startsWith('@') || c.startsWith('-')) return c;
  if (/^-?\d+$/.test(c)) return c;
  return `@${c}`;
}

/**
 * Strips duplicate URLs or invalid trailing URLs accidentally pasted by users.
 */
function sanitizeMediaUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  let url = rawUrl.trim();
  const match = url.match(/https?:\/\/[^\s"'<>]+/gi);
  if (match && match.length > 0) {
    let first = match[0];
    const secondIndex = first.indexOf('http', 4);
    if (secondIndex !== -1) {
      first = first.substring(0, secondIndex);
    }
    return first.trim();
  }
  return url;
}

// Helper to retrieve a setting from DB or environment fallback
async function getSetting(key: string, envFallback: string = ''): Promise<string> {
  const row = await SystemSetting.findOne({ where: { key } });
  if (row && row.value) return row.value.trim();
  return (process.env[key] || envFallback).trim();
}

async function setSetting(key: string, value: string): Promise<void> {
  const existing = await SystemSetting.findOne({ where: { key } });
  if (existing) {
    existing.value = value.trim();
    await existing.save();
  } else {
    await SystemSetting.create({ key, value: value.trim() });
  }
}

// 1. Get Telegram Bot & Channels Configuration
export const getTelegramConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const botToken = await getSetting('TELEGRAM_BOT_TOKEN');
    const publicChannelId = await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID', '@Akashscalpertrading');
    const paidChannelId = await getSetting('TELEGRAM_PAID_CHANNEL_ID', '@Akashscalpertrading_vip');

    const botTokenMasked = botToken 
      ? `${botToken.substring(0, 6)}••••••••••••${botToken.substring(botToken.length - 4)}` 
      : '';

    res.json({
      botTokenMasked,
      isConfigured: Boolean(botToken && (publicChannelId || paidChannelId)),
      publicChannelId,
      paidChannelId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Telegram config' });
  }
};

// 2. Save Telegram Bot & Channels Configuration
const configSchema = z.object({
  botToken: z.string().optional(),
  publicChannelId: z.string().min(1, 'Public channel ID or username is required'),
  paidChannelId: z.string().min(1, 'Paid/VIP channel ID or username is required'),
});

export const saveTelegramConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = configSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    let { botToken, publicChannelId, paidChannelId } = parsed.data;

    let cleanPublic = normalizeChannel(publicChannelId, '@Akashscalpertrading');
    let cleanPaid = normalizeChannel(paidChannelId, '@Akashscalpertrading_vip');

    if (botToken && !botToken.includes('••••')) {
      await setSetting('TELEGRAM_BOT_TOKEN', botToken.trim());
    }
    await setSetting('TELEGRAM_PUBLIC_CHANNEL_ID', cleanPublic);
    await setSetting('TELEGRAM_PAID_CHANNEL_ID', cleanPaid);

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_TELEGRAM_CONFIG',
      resource: 'system_settings',
      newValue: { publicChannelId: cleanPublic, paidChannelId: cleanPaid },
      ipAddress: req.ip,
    });

    res.json({ message: 'Telegram bot settings saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save Telegram config' });
  }
};

// 3. Test Telegram Bot Connection & Channel Admin Rights
export const testTelegramConnection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const botTokenInput = req.body?.botToken?.trim();
    const botToken = (botTokenInput && !botTokenInput.includes('••••'))
      ? botTokenInput
      : await getSetting('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      res.status(400).json({ 
        success: false, 
        error: 'Telegram Bot Token is not configured. Please enter a bot token from @BotFather.' 
      });
      return;
    }

    const meData = await telegramApiCall(botToken, 'getMe');

    if (!meData.ok || !meData.result) {
      res.status(400).json({ 
        success: false, 
        error: `Telegram API Error: ${meData.description || 'Invalid Bot Token'}` 
      });
      return;
    }

    const botId = meData.result.id;
    const botUsername = meData.result.username;

    const rawPublic = req.body?.publicChannelId || await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID', '@Akashscalpertrading');
    const rawPaid = req.body?.paidChannelId || await getSetting('TELEGRAM_PAID_CHANNEL_ID', '@Akashscalpertrading_vip');
    const publicChannelId = normalizeChannel(rawPublic, '@Akashscalpertrading');
    const paidChannelId = normalizeChannel(rawPaid, '@Akashscalpertrading_vip');

    // Deep check public channel
    let publicCheck = { configured: Boolean(publicChannelId), title: '', isAdmin: false, message: '' };
    if (publicChannelId) {
      try {
        const chatData = await telegramApiCall(botToken, `getChat?chat_id=${encodeURIComponent(publicChannelId)}`);
        if (chatData.ok && chatData.result) {
          publicCheck.title = chatData.result.title || publicChannelId;
          const memberData = await telegramApiCall(botToken, `getChatMember?chat_id=${encodeURIComponent(publicChannelId)}&user_id=${botId}`);
          
          if (memberData.ok && (memberData.result?.status === 'administrator' || memberData.result?.status === 'creator')) {
            publicCheck.isAdmin = true;
            publicCheck.message = `Bot @${botUsername} is verified as Administrator in "${publicCheck.title}" with message posting permissions.`;
          } else {
            publicCheck.isAdmin = false;
            publicCheck.message = `Bot @${botUsername} is NOT an Administrator yet in "${publicCheck.title}". Action: In Telegram, go to channel settings > Administrators > Add @${botUsername} with "Post Messages" enabled.`;
          }
        } else {
          publicCheck.message = `Channel "${publicChannelId}" could not be reached: ${chatData.description}.`;
        }
      } catch (cErr: any) {
        publicCheck.message = `Channel verification error: ${cErr.message}`;
      }
    }

    const overallSuccess = meData.ok;
    const readyToBroadcast = publicCheck.isAdmin;

    res.json({
      success: overallSuccess,
      readyToBroadcast,
      bot: meData.result,
      publicChannelId,
      paidChannelId,
      publicCheck,
      message: readyToBroadcast
        ? `Bot @${botUsername} is connected and verified as Administrator in ${publicChannelId}!`
        : `Connected to @${botUsername}, but bot must be added as Administrator in ${publicChannelId} to broadcast!`
    });
  } catch (error: any) {
    console.error('testTelegramConnection error:', error);
    res.status(500).json({ success: false, error: error.message || 'Connection test failed' });
  }
};

// 4. Create & Broadcast Post to Telegram (Public vs Paid Subscribers)
const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(5, 'Post content must be at least 5 characters'),
  audience: z.enum(['PUBLIC', 'PAID_MEMBERS']),
  targetTier: z.enum(['ALL', 'BASIC', 'PREMIUM', 'VIP']).default('ALL'),
  category: z.string().default('ANNOUNCEMENT'),
  mediaUrl: z.string().url('Invalid Media URL').optional().or(z.literal('')),
  buttonText: z.string().optional(),
  buttonUrl: z.string().url('Invalid button URL').optional().or(z.literal('')),
  pinMessage: z.boolean().default(false),
  sendInAppNotification: z.boolean().default(true),
});

export const createTelegramPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const {
      title,
      content,
      audience,
      targetTier,
      category,
      mediaUrl,
      buttonText,
      buttonUrl,
      pinMessage,
      sendInAppNotification
    } = parsed.data;

    const botToken = await getSetting('TELEGRAM_BOT_TOKEN');
    const rawPublic = await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID', '@Akashscalpertrading');
    const rawPaid = await getSetting('TELEGRAM_PAID_CHANNEL_ID', '@Akashscalpertrading_vip');

    const publicChannelId = normalizeChannel(rawPublic, '@Akashscalpertrading');
    const paidChannelId = normalizeChannel(rawPaid, '@Akashscalpertrading_vip');
    const targetChannel = audience === 'PUBLIC' ? publicChannelId : paidChannelId;
    const cleanMedia = sanitizeMediaUrl(mediaUrl);

    let categoryEmoji = '📢';
    if (category === 'SIGNAL') categoryEmoji = '⚡';
    if (category === 'MARKET_ANALYSIS') categoryEmoji = '📊';
    if (category === 'TARGET_HIT') categoryEmoji = '🎯';
    if (category === 'EDUCATIONAL') categoryEmoji = '💡';

    const audienceBadge = audience === 'PAID_MEMBERS'
      ? `🔒 <b>[EXCLUSIVE VIP SUBSCRIBERS - ${targetTier} TIER]</b>`
      : `🌐 <b>[FREE PUBLIC CHANNEL UPDATE]</b>`;

    const formattedHtml = `<b>${categoryEmoji} ${title}</b>\n\n${content}\n\n${audienceBadge}\n<i>Via Scalper Akash Platform</i>`;

    let tgStatus: 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
    let tgMessageId: string | null = null;
    let tgResponseLog: string | null = null;

    if (botToken && targetChannel) {
      try {
        const replyMarkup = (buttonText && buttonUrl) ? {
          inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
        } : undefined;

        let tgData: TelegramApiResponse;

        if (cleanMedia) {
          // Attempt sending with photo
          tgData = await telegramApiCall(botToken, 'sendPhoto', {
            chat_id: targetChannel,
            photo: cleanMedia,
            caption: formattedHtml,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          });

          // Fallback to text message if photo fetching fails
          if (!tgData.ok && (tgData.description?.includes('failed to get HTTP URL content') || tgData.description?.includes('wrong file identifier'))) {
            console.warn('sendPhoto failed on image URL, falling back to sendMessage:', tgData.description);
            tgData = await telegramApiCall(botToken, 'sendMessage', {
              chat_id: targetChannel,
              text: formattedHtml,
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
              disable_web_page_preview: false,
            });
          }
        } else {
          // Send as text message
          tgData = await telegramApiCall(botToken, 'sendMessage', {
            chat_id: targetChannel,
            text: formattedHtml,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
            disable_web_page_preview: false,
          });
        }

        tgResponseLog = JSON.stringify(tgData);

        if (tgData.ok) {
          tgStatus = 'SENT';
          tgMessageId = tgData.result?.message_id ? String(tgData.result.message_id) : null;

          if (pinMessage && tgMessageId) {
            try {
              await telegramApiCall(botToken, 'pinChatMessage', {
                chat_id: targetChannel,
                message_id: tgMessageId,
                disable_notification: false,
              });
            } catch (pinErr) {
              console.warn('Could not pin message in Telegram:', pinErr);
            }
          }
        } else {
          tgStatus = 'FAILED';
          if (tgData.description?.includes('bot is not a member of the channel chat') || tgData.description?.includes('have no rights to send a message')) {
            tgResponseLog = `Telegram Error (403): Bot @akashpatil_03bot is not an Administrator in channel ${targetChannel}. Please open Telegram > Channel '${targetChannel}' > Manage/Edit > Administrators > Add Administrator > Search '@akashpatil_03bot' and enable 'Post Messages'.`;
          } else {
            tgResponseLog = `Telegram API Error: ${tgData.description || 'Request rejected'}`;
          }
          console.error('Telegram dispatch error response:', tgData);
        }
      } catch (err: any) {
        tgStatus = 'FAILED';
        tgResponseLog = `Network error: ${err.message}. Ensure internet connectivity to Telegram API.`;
        console.error('Telegram network dispatch failed:', err);
      }
    } else {
      tgStatus = 'SIMULATED';
      tgResponseLog = 'Simulated dispatch: Telegram Bot Token is not configured. Add your Bot Token from @BotFather in Bot & Channel Settings (or backend/.env) to broadcast live to Telegram.';
    }

    // Persist post to Database
    const post = await TelegramPost.create({
      title,
      content,
      audience,
      targetTier,
      category,
      mediaUrl: cleanMedia || null,
      buttonText: buttonText || null,
      buttonUrl: buttonUrl || null,
      telegramChannelId: targetChannel,
      telegramMessageId: tgMessageId,
      status: tgStatus,
      responseLog: tgResponseLog,
      pinMessage,
      authorId: req.user?.id || null,
      sentAt: new Date(),
    });

    // Optionally dispatch In-App notification
    if (sendInAppNotification) {
      try {
        let recipientUsers: User[] = [];
        if (audience === 'PUBLIC') {
          recipientUsers = await User.findAll({ where: { status: 'ACTIVE' }, limit: 500 });
        } else {
          const subs = await Subscription.findAll({
            where: { status: 'ACTIVE' },
            include: [{
              model: Plan,
              where: targetTier === 'ALL' ? {} : { accessTier: targetTier },
            }, {
              model: User,
              where: { status: 'ACTIVE' },
            }],
            limit: 500,
          });
          recipientUsers = subs.map(s => s.User).filter(Boolean) as User[];
        }

        const notifications = recipientUsers.map(u => ({
          userId: u.id,
          title: `[Telegram ${audience === 'PAID_MEMBERS' ? 'VIP' : 'Public'}] ${title}`,
          message: content.substring(0, 180) + (content.length > 180 ? '...' : ''),
          type: audience === 'PAID_MEMBERS' ? 'VIP_SIGNAL' : 'ANNOUNCEMENT',
        }));

        if (notifications.length > 0) {
          await Notification.bulkCreate(notifications);
        }
      } catch (notifErr) {
        console.warn('In-app notification dispatch skipped/failed:', notifErr);
      }
    }

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_TELEGRAM_POST',
      resource: 'telegram_posts',
      newValue: { id: post.id, audience, targetChannel, status: tgStatus },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: tgStatus === 'SENT' 
        ? `Post published LIVE to Telegram channel ${targetChannel}!`
        : (tgStatus === 'SIMULATED'
          ? `⚠️ Post saved in SIMULATED mode. Telegram Bot Token is not configured yet. Configure your Bot Token in settings or backend/.env to publish live to Telegram.`
          : `❌ Telegram dispatch failed: ${tgResponseLog || 'Telegram API rejected request'}`),
      post,
      status: tgStatus,
      channel: targetChannel,
      responseLog: tgResponseLog,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to dispatch Telegram post' });
  }
};

// 5. Retrieve Admin Telegram Posts History
export const getTelegramPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { audience } = req.query;

    const where: any = {};
    if (audience && audience !== 'ALL') {
      where.audience = audience;
    }

    const posts = await TelegramPost.findAll({
      where,
      include: [{ model: User, as: 'Author', attributes: ['id', 'fullName', 'email'] }],
      order: [['sentAt', 'DESC']],
      limit: 100,
    });

    const publicCount = await TelegramPost.count({ where: { audience: 'PUBLIC' } });
    const paidCount = await TelegramPost.count({ where: { audience: 'PAID_MEMBERS' } });
    const liveSentCount = await TelegramPost.count({ where: { status: 'SENT' } });

    res.json({
      posts,
      stats: {
        total: posts.length,
        publicCount,
        paidCount,
        liveSentCount,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Telegram post history' });
  }
};

// 6. Delete a Telegram Post Record
export const deleteTelegramPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await TelegramPost.findByPk(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const botToken = await getSetting('TELEGRAM_BOT_TOKEN');
    if (botToken && post.telegramChannelId && post.telegramMessageId) {
      try {
        await telegramApiCall(botToken, 'deleteMessage', {
          chat_id: post.telegramChannelId,
          message_id: post.telegramMessageId,
        });
      } catch (delErr) {
        console.warn('Could not delete message from Telegram:', delErr);
      }
    }

    await post.destroy();
    res.json({ message: 'Telegram post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete post' });
  }
};

// 7. Retry Dispatched Post to Telegram
export const retryTelegramPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await TelegramPost.findByPk(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const botToken = await getSetting('TELEGRAM_BOT_TOKEN');
    const rawPublic = await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID', '@Akashscalpertrading');
    const rawPaid = await getSetting('TELEGRAM_PAID_CHANNEL_ID', '@Akashscalpertrading_vip');
    const publicChannelId = normalizeChannel(rawPublic, '@Akashscalpertrading');
    const paidChannelId = normalizeChannel(rawPaid, '@Akashscalpertrading_vip');
    const targetChannel = post.audience === 'PUBLIC' ? publicChannelId : paidChannelId;
    const cleanMedia = sanitizeMediaUrl(post.mediaUrl);

    if (!botToken) {
      res.status(400).json({ error: 'Telegram Bot Token is not configured' });
      return;
    }

    let categoryEmoji = '📢';
    if (post.category === 'SIGNAL') categoryEmoji = '⚡';
    if (post.category === 'MARKET_ANALYSIS') categoryEmoji = '📊';
    if (post.category === 'TARGET_HIT') categoryEmoji = '🎯';
    if (post.category === 'EDUCATIONAL') categoryEmoji = '💡';

    const audienceBadge = post.audience === 'PAID_MEMBERS'
      ? `🔒 <b>[EXCLUSIVE VIP SUBSCRIBERS - ${post.targetTier} TIER]</b>`
      : `🌐 <b>[FREE PUBLIC CHANNEL UPDATE]</b>`;

    const formattedHtml = `<b>${categoryEmoji} ${post.title}</b>\n\n${post.content}\n\n${audienceBadge}\n<i>Via Scalper Akash Platform</i>`;

    const replyMarkup = (post.buttonText && post.buttonUrl) ? {
      inline_keyboard: [[{ text: post.buttonText, url: post.buttonUrl }]]
    } : undefined;

    let tgData: TelegramApiResponse;

    if (cleanMedia) {
      tgData = await telegramApiCall(botToken, 'sendPhoto', {
        chat_id: targetChannel,
        photo: cleanMedia,
        caption: formattedHtml,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      });

      // If photo fails due to external URL issue, fall back to text message
      if (!tgData.ok && (tgData.description?.includes('failed to get HTTP URL content') || tgData.description?.includes('wrong file identifier'))) {
        console.warn('sendPhoto failed on retry, falling back to sendMessage:', tgData.description);
        tgData = await telegramApiCall(botToken, 'sendMessage', {
          chat_id: targetChannel,
          text: formattedHtml,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
          disable_web_page_preview: false,
        });
      }
    } else {
      tgData = await telegramApiCall(botToken, 'sendMessage', {
        chat_id: targetChannel,
        text: formattedHtml,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
        disable_web_page_preview: false,
      });
    }

    let tgResponseLog = JSON.stringify(tgData);

    if (tgData.ok) {
      post.telegramMessageId = tgData.result?.message_id ? String(tgData.result.message_id) : null;
      post.status = 'SENT';
      post.telegramChannelId = targetChannel;
      post.mediaUrl = cleanMedia;
      post.responseLog = `Dispatched successfully to ${targetChannel} (Message ID: ${post.telegramMessageId})`;
      post.sentAt = new Date();
      await post.save();

      res.json({
        success: true,
        message: `Successfully broadcasted to Telegram channel ${targetChannel}!`,
        post
      });
    } else {
      if (tgData.description?.includes('bot is not a member of the channel chat') || tgData.description?.includes('have no rights to send a message')) {
        tgResponseLog = `Telegram Error (403): Bot @akashpatil_03bot is not an Administrator in channel ${targetChannel}. Please open Telegram > Channel '${targetChannel}' > Manage/Edit > Administrators > Add Administrator > Search '@akashpatil_03bot' and enable 'Post Messages'.`;
      } else {
        tgResponseLog = `Telegram API Error: ${tgData.description || 'Request rejected'}`;
      }

      post.status = 'FAILED';
      post.telegramChannelId = targetChannel;
      post.responseLog = tgResponseLog;
      await post.save();

      res.status(400).json({
        success: false,
        error: tgResponseLog,
        post
      });
    }
  } catch (error: any) {
    console.error('retryTelegramPost error:', error);
    res.status(500).json({ error: error.message || 'Retry dispatch failed' });
  }
};

// 8. Public Feed for Open Website Visitors & Non-Paid Users
export const getPublicTelegramFeed = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const posts = await TelegramPost.findAll({
      where: { audience: 'PUBLIC' },
      order: [['sentAt', 'DESC']],
      limit: 30,
    });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch public feed' });
  }
};

// 9. Exclusive Feed for Paid / Subscribed Members
export const getSubscriberTelegramFeed = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasAdminRole = req.user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'TRADER'].includes(r));
    const activeSub = await Subscription.findOne({
      where: { userId, status: 'ACTIVE' },
      include: [Plan],
    });

    if (!activeSub && !hasAdminRole) {
      res.status(403).json({
        error: 'Exclusive for active plan subscribers. Please purchase a plan to unlock VIP Telegram signals.',
        isSubscriber: false,
      });
      return;
    }

    const posts = await TelegramPost.findAll({
      order: [['sentAt', 'DESC']],
      limit: 50,
    });

    res.json({
      isSubscriber: true,
      activePlan: activeSub?.Plan?.name || 'Administrator VIP',
      tier: activeSub?.Plan?.accessTier || 'VIP',
      posts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch subscriber feed' });
  }
};
