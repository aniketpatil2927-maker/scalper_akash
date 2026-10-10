import { Response } from 'express';
import { z } from 'zod';
import { TelegramPost, SystemSetting, User, Subscription, Notification, Plan } from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

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
    const publicChannelId = await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID', '@scalper_akash_free');
    const paidChannelId = await getSetting('TELEGRAM_PAID_CHANNEL_ID', '@scalper_akash_vip');

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

    const { botToken, publicChannelId, paidChannelId } = parsed.data;

    if (botToken && !botToken.includes('••••')) {
      await setSetting('TELEGRAM_BOT_TOKEN', botToken);
    }
    await setSetting('TELEGRAM_PUBLIC_CHANNEL_ID', publicChannelId);
    await setSetting('TELEGRAM_PAID_CHANNEL_ID', paidChannelId);

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_TELEGRAM_CONFIG',
      resource: 'system_settings',
      newValue: { publicChannelId, paidChannelId },
      ipAddress: req.ip,
    });

    res.json({ message: 'Telegram bot settings saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save Telegram config' });
  }
};

// 3. Test Telegram Bot Connection & Credentials
export const testTelegramConnection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const botToken = await getSetting('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      res.status(400).json({ 
        success: false, 
        error: 'Telegram Bot Token is not configured. Please enter a bot token from @BotFather.' 
      });
      return;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await tgRes.json();

    if (!data.ok) {
      res.status(400).json({ 
        success: false, 
        error: `Telegram API Error: ${data.description || 'Invalid Bot Token'}` 
      });
      return;
    }

    const publicChannelId = await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID');
    const paidChannelId = await getSetting('TELEGRAM_PAID_CHANNEL_ID');

    res.json({
      success: true,
      bot: data.result,
      publicChannelId,
      paidChannelId,
      message: `Connected successfully as @${data.result.username} (${data.result.first_name})`
    });
  } catch (error: any) {
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
    const publicChannelId = await getSetting('TELEGRAM_PUBLIC_CHANNEL_ID', '@scalper_akash_free');
    const paidChannelId = await getSetting('TELEGRAM_PAID_CHANNEL_ID', '@scalper_akash_vip');

    const targetChannel = audience === 'PUBLIC' ? publicChannelId : paidChannelId;

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

    // Send to Telegram API if Bot Token and Channel are provided
    if (botToken && targetChannel) {
      try {
        const replyMarkup = (buttonText && buttonUrl) ? {
          inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
        } : undefined;

        let tgRes: any;
        if (mediaUrl && mediaUrl.trim()) {
          // Send as photo with caption
          tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChannel,
              photo: mediaUrl.trim(),
              caption: formattedHtml,
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
            }),
          });
        } else {
          // Send as text message
          tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChannel,
              text: formattedHtml,
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
              disable_web_page_preview: false,
            }),
          });
        }

        const tgData = await tgRes.json();
        tgResponseLog = JSON.stringify(tgData);

        if (tgData.ok) {
          tgStatus = 'SENT';
          tgMessageId = tgData.result?.message_id ? String(tgData.result.message_id) : null;

          // Pin message if requested
          if (pinMessage && tgMessageId) {
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/pinChatMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: targetChannel,
                  message_id: tgMessageId,
                  disable_notification: false,
                }),
              });
            } catch (pinErr) {
              console.warn('Could not pin message in Telegram:', pinErr);
            }
          }
        } else {
          tgStatus = 'FAILED';
          console.error('Telegram dispatch error response:', tgData);
        }
      } catch (err: any) {
        tgStatus = 'FAILED';
        tgResponseLog = err.message;
        console.error('Telegram network dispatch failed:', err);
      }
    } else {
      tgStatus = 'SIMULATED';
      tgResponseLog = 'Simulated dispatch (Bot Token or Channel ID not fully configured). Add bot token to post live.';
    }

    // Persist post to Database
    const post = await TelegramPost.create({
      title,
      content,
      audience,
      targetTier,
      category,
      mediaUrl: mediaUrl || null,
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
        ? `Post published live to Telegram channel ${targetChannel}!`
        : `Post saved with status '${tgStatus}'. (${tgResponseLog || 'Check Telegram Bot settings'})`,
      post,
      status: tgStatus,
      channel: targetChannel,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to dispatch Telegram post' });
  }
};

// 5. Retrieve Admin Telegram Posts History
export const getTelegramPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { audience, search } = req.query;

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

    // Try deleting from Telegram channel if bot token is available
    const botToken = await getSetting('TELEGRAM_BOT_TOKEN');
    if (botToken && post.telegramChannelId && post.telegramMessageId) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: post.telegramChannelId,
            message_id: post.telegramMessageId,
          }),
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

// 7. Public Feed for Open Website Visitors & Non-Paid Users
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

// 8. Exclusive Feed for Paid / Subscribed Members
export const getSubscriberTelegramFeed = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user has an active subscription or is an Admin/Trader
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
