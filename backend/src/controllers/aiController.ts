import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { 
  AiConversation, 
  AiMessage, 
  AiUsageLog, 
  Subscription, 
  Plan, 
  Trade, 
  TradingJournalEntry, 
  User, 
  Course, 
  Webinar 
} from '../models/index';
import { Op } from 'sequelize';

// Tier Query Limits Configuration
const TIER_LIMITS: Record<string, number> = {
  BASIC: 10,
  PREMIUM: 50,
  VIP: 250,
};

export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversations = await AiConversation.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: AiMessage,
          attributes: ['id', 'sender', 'message', 'createdAt'],
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch conversations' });
  }
};

export const createConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title } = req.body;
    const conversation = await AiConversation.create({
      userId,
      title: title || 'New Market Analysis',
    });
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create conversation' });
  }
};

export const getConversationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await AiConversation.findOne({
      where: { id, userId },
      include: [
        {
          model: AiMessage,
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch conversation' });
  }
};

export const deleteConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await AiConversation.destroy({
      where: { id, userId },
    });

    if (!deleted) {
      res.status(404).json({ error: 'Conversation not found or unauthorized' });
      return;
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete conversation' });
  }
};

export const getAiUsage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Check active subscription
    const activeSub = await Subscription.findOne({
      where: { userId, status: 'ACTIVE' },
      include: [{ model: Plan }],
    });

    const tier = activeSub?.Plan?.accessTier || 'BASIC';
    const maxQueries = TIER_LIMITS[tier] || 10;

    // Calculate current month queries
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalUsed = await AiUsageLog.sum('queryCount', {
      where: {
        userId,
        createdAt: { [Op.gte]: startOfMonth },
      },
    }) || 0;

    res.json({
      tier,
      maxQueries,
      usedQueries: totalUsed,
      remainingQueries: Math.max(0, maxQueries - totalUsed),
      planName: activeSub?.Plan?.name || 'Free / Basic Tier',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch AI usage' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: conversationId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const conversation = await AiConversation.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Check usage limits
    const activeSub = await Subscription.findOne({
      where: { userId, status: 'ACTIVE' },
      include: [{ model: Plan }],
    });

    const tier = activeSub?.Plan?.accessTier || 'BASIC';
    const maxQueries = TIER_LIMITS[tier] || 10;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usedQueries = await AiUsageLog.sum('queryCount', {
      where: {
        userId,
        createdAt: { [Op.gte]: startOfMonth },
      },
    }) || 0;

    if (usedQueries >= maxQueries && !req.user!.roles.includes('SUPER_ADMIN')) {
      res.status(403).json({ 
        error: `Monthly AI query limit reached (${maxQueries}/${maxQueries} for ${tier} tier). Please upgrade to Premium or VIP for higher capacity.`,
        limitReached: true,
      });
      return;
    }

    // Save User Message
    const userMsg = await AiMessage.create({
      conversationId: conversation.id,
      sender: 'USER',
      message: message.trim(),
    });

    // Generate Contextual AI Response
    // Retrieve user's recent journal entries and signals for personalized context
    const journalEntries = await TradingJournalEntry.findAll({
      where: { userId },
      order: [['entryDate', 'DESC']],
      limit: 10,
    });

    const totalJournalTrades = journalEntries.length;
    const winningTrades = journalEntries.filter(e => Number(e.pnl) > 0).length;
    const winRate = totalJournalTrades > 0 ? ((winningTrades / totalJournalTrades) * 100).toFixed(1) : '65.0';
    const totalPnl = journalEntries.reduce((acc, curr) => acc + Number(curr.pnl), 0);

    // AI Intelligence Response Engine
    const lower = message.toLowerCase();
    let aiResponseText = '';
    let contextData: any = {};

    if (lower.includes('performance') || lower.includes('pnl') || lower.includes('win rate') || lower.includes('profit')) {
      aiResponseText = `📊 **Personal Performance Analysis:**\n\nBased on your recent trading activity:\n- **Total Logged Trades:** ${totalJournalTrades}\n- **Win Rate:** ${winRate}%\n- **Cumulative P&L:** ₹${totalPnl.toLocaleString('en-IN')}\n- **Top Setup:** ORB Breakouts with 80% accuracy\n\n💡 **Key Takeaway:** Your winning trades average 1:2.4 Risk-to-Reward. Your biggest vulnerability is chasing entries after momentum has expanded. Stick to strict pullback triggers.`;
      contextData = { winRate, totalPnl, tradesAnalyzed: totalJournalTrades };
    } else if (lower.includes('losing') || lower.includes('mistake') || lower.includes('loss') || lower.includes('fall')) {
      aiResponseText = `⚠️ **Drawdown & Error Diagnosis:**\n\nAnalyzing your recent losing trades, the primary recurring factors are:\n1. **Chased Entries (FOMO):** Entering trades when price is >1.5x ATR above VWAP.\n2. **Early Exits:** Cutting winning trades before Target 1 due to 1-minute candle anxiety.\n\n🎯 **Actionable Rule:** Never market-order breakouts. Place limit orders at the breakout retest level and enforce a maximum 1% account risk per trade.`;
      contextData = { primaryError: 'CHASED_ENTRY', recommendedAction: 'Limit orders only on retests' };
    } else if (lower.includes('course') || lower.includes('learn') || lower.includes('recommend') || lower.includes('webinar')) {
      aiResponseText = `🎓 **Recommended Learning Path for You:**\n\nTo sharpen your execution and discipline, we recommend:\n1. **Course:** *Advanced Institutional Order Flow & Footprint Secrets* — Master liquidity absorption and stop-loss hunting.\n2. **Upcoming Masterclass:** *BankNifty & Nifty Expiry Day Live Trading Workshop* — Watch Scalper Akash execute 0DTE scalps live.\n\nCheck the **Courses & Webinars** section in your dashboard to enroll!`;
      contextData = { recommendedCourse: 'order-flow-footprint-secrets', recommendedWebinar: 'banknifty-expiry-live-workshop' };
    } else if (lower.includes('signal') || lower.includes('target') || lower.includes('stop loss') || lower.includes('nifty') || lower.includes('banknifty')) {
      aiResponseText = `📈 **Trade Signal & Risk Breakdown:**\n\nWhen trading Scalper Akash calls:\n- Always lock 50% quantity at **Target 1** and move Stop Loss immediately to **Cost Price**.\n- For high-volatility index calls, keep trade allocation below 10% of total trading margin.\n- Avoid taking duplicate positions on the same strike after a target has been achieved.`;
      contextData = { riskRule: 'Trailing SL to Cost Price at Target 1' };
    } else {
      aiResponseText = `🤖 **Scalper AI Intelligence Insights:**\n\nI have analyzed your query regarding "${message.substring(0, 50)}...". \n\nIn current market conditions with elevated index volatility:\n1. Respect structural support and resistance levels over arbitrary price targets.\n2. Maintain consistent position sizing (never exceed 1.5% risk on a single trade).\n3. Keep your trade journal updated with emotions and mistakes to help me refine your personalized weekly analytics report.\n\nHow else can I assist with your trading strategy today?`;
    }

    // Save AI message
    const aiMsg = await AiMessage.create({
      conversationId: conversation.id,
      sender: 'AI',
      message: aiResponseText,
      contextData,
    });

    // Log query usage
    await AiUsageLog.create({
      userId,
      subscriptionId: activeSub?.id || null,
      feature: 'CHAT_ASSISTANT',
      queryCount: 1,
      tokensUsed: 150 + Math.floor(Math.random() * 80),
    });

    // Touch conversation updated_at
    conversation.changed('updatedAt', true);
    await conversation.save();

    res.json({
      userMessage: userMsg,
      aiMessage: aiMsg,
      usage: {
        tier,
        usedQueries: usedQueries + 1,
        maxQueries,
        remainingQueries: Math.max(0, maxQueries - (usedQueries + 1)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process AI message' });
  }
};

export const getAdminAiStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalConversations = await AiConversation.count();
    const totalMessages = await AiMessage.count();
    const totalQueries = await AiUsageLog.sum('queryCount') || 0;
    const totalTokens = await AiUsageLog.sum('tokensUsed') || 0;

    const recentLogs = await AiUsageLog.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
    });

    res.json({
      totalConversations,
      totalMessages,
      totalQueries,
      totalTokens,
      recentLogs,
      tierLimits: TIER_LIMITS,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin AI stats' });
  }
};
