import { Response } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import { sequelize } from '../config/db';
import { 
  Trade, 
  Subscription, 
  SubscriptionTrade, 
  TradeUpdate, 
  Notification, 
  User, 
  Plan 
} from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

// Input validators
const tradeSchema = z.object({
  asset: z.string().min(1, 'Asset symbol is required'),
  direction: z.enum(['BUY', 'SELL']),
  entryPrice: z.number().positive('Entry price must be positive'),
  stopLoss: z.number().positive('Stop loss must be positive'),
  target1: z.number().positive('Target 1 must be positive'),
  target2: z.number().positive('Target 2 must be positive').optional().nullable(),
  target3: z.number().positive('Target 3 must be positive').optional().nullable(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  accessTier: z.enum(['BASIC', 'PREMIUM', 'VIP']),
  analysis: z.string().optional().nullable(),
  commentary: z.string().optional().nullable(),
});

const updateTradeSchema = z.object({
  entryPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  target1: z.number().positive().optional(),
  target2: z.number().positive().optional().nullable(),
  target3: z.number().positive().optional().nullable(),
  analysis: z.string().optional().nullable(),
  commentary: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ACTIVE', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED', 'CANCELLED', 'EXPIRED']).optional(),
});

// --- User Endpoints ---

// Get trade signals assigned to the logged-in user
export const getMyTrades = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find all subscriptions of this user
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
    });

    const subIds = subscriptions.map(sub => sub.id);
    if (subIds.length === 0) {
      res.json([]);
      return;
    }

    // Find all trades mapped to these subscriptions through subscription_trades
    const allocatedTrades = await SubscriptionTrade.findAll({
      where: { subscriptionId: subIds },
      include: [
        {
          model: Trade,
          include: [{ model: TradeUpdate, limit: 10, order: [['createdAt', 'DESC']] }],
        },
      ],
      order: [['allocatedAt', 'DESC']],
    });

    const trades = allocatedTrades.map(at => {
      const tradeJson = at.Trade.toJSON();
      return {
        ...tradeJson,
        allocatedAt: at.allocatedAt,
        subscriptionId: at.subscriptionId,
      };
    });

    res.json(trades);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getMyTradeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;

    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
    });
    const subIds = subscriptions.map(sub => sub.id);

    const allocation = await SubscriptionTrade.findOne({
      where: {
        tradeId: id,
        subscriptionId: subIds,
      },
      include: [
        {
          model: Trade,
          include: [{ model: TradeUpdate, order: [['createdAt', 'DESC']] }],
        },
      ],
    });

    if (!allocation) {
      res.status(403).json({ error: 'Access denied: You are not subscribed to this trade' });
      return;
    }

    res.json({
      ...allocation.Trade.toJSON(),
      allocatedAt: allocation.allocatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// --- Trader / Admin Endpoints ---

// Get all trades (Trader view)
export const getTraderTrades = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const trades = await Trade.findAll({
      include: [{ model: TradeUpdate, order: [['createdAt', 'DESC']] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(trades);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Create a trade (saves as DRAFT)
export const createTrade = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = tradeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const trade = await Trade.create({
      ...parsed.data,
      status: 'DRAFT',
    });

    await logAudit({
      userId: req.user?.id,
      action: 'TRADE_CREATED',
      resource: 'trades',
      newValue: trade,
      ipAddress: req.ip,
    });

    res.status(201).json(trade);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Publish Trade (Runs the Two-Trade Allocation Engine)
export const publishTrade = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const trade = await Trade.findByPk(id, { transaction });
    
    if (!trade) {
      res.status(404).json({ error: 'Trade not found' });
      await transaction.rollback();
      return;
    }

    if (trade.status !== 'DRAFT' && trade.status !== 'SCHEDULED') {
      res.status(400).json({ error: 'Trade can only be published from DRAFT or SCHEDULED status' });
      await transaction.rollback();
      return;
    }

    // 1. Fetch eligible subscriptions
    // Eligibility criteria: 
    // - User account is active (User.status = 'ACTIVE')
    // - Subscription is active (Subscription.status = 'ACTIVE')
    // - Plan validity is valid (Subscription.expiry_date >= NOW)
    // - Remaining trades > 0 (Subscription.remaining_trades > 0)
    // - Subscribed plan's access_tier matches trade's access_tier
    const eligibleSubscriptions = await Subscription.findAll({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          [Op.gt]: new Date(),
        },
        remainingTrades: {
          [Op.gt]: 0,
        },
      },
      include: [
        {
          model: User,
          where: { status: 'ACTIVE' },
          attributes: ['id', 'email', 'fullName'],
        },
        {
          model: Plan,
          where: { accessTier: trade.accessTier },
          attributes: ['id', 'name', 'accessTier'],
        },
      ],
      transaction,
    });

    let allocatedCount = 0;

    // 2. Loop through each eligible subscription and assign trade
    for (const sub of eligibleSubscriptions) {
      // Server-side double validation (Rule 2)
      if (sub.remainingTrades <= 0 || sub.usedTrades >= sub.allowedTrades) {
        // Safe check to reject
        continue;
      }

      // Decrement credits
      sub.usedTrades += 1;
      sub.remainingTrades -= 1;
      await sub.save({ transaction });

      // Link trade to subscription
      await SubscriptionTrade.create({
        subscriptionId: sub.id,
        tradeId: trade.id,
      }, { transaction });

      // Create notifications (In-app)
      await Notification.create({
        userId: sub.userId,
        title: 'New Trade Signal Available',
        message: `A new ${trade.accessTier} trade signal on ${trade.asset} (${trade.direction}) is available. Entry: ${trade.entryPrice}, Target: ${trade.target1}. Open dashboard to view details.`,
        type: 'TRADE_SIGNAL',
      }, { transaction });

      console.log(`[Notification Mock] Email sent to ${sub.User.email}: New Trade signal on ${trade.asset}`);
      allocatedCount++;
    }

    // 3. Update trade status to ACTIVE
    await trade.update({
      status: 'ACTIVE',
      publishedAt: new Date(),
    }, { transaction });

    await logAudit({
      userId: req.user?.id,
      action: 'TRADE_PUBLISHED',
      resource: 'trades',
      newValue: { tradeId: trade.id, allocatedTo: allocatedCount },
      ipAddress: req.ip,
    });

    await transaction.commit();

    res.json({
      message: `Trade published successfully and allocated to ${allocatedCount} subscribers.`,
      trade,
      allocatedCount,
    });

  } catch (error: any) {
    await transaction.rollback();
    console.error('Publish trade error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Update Trade (e.g. adjust stop loss, targets, risk, etc.)
export const updateTrade = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const trade = await Trade.findByPk(id, { transaction });
    if (!trade) {
      res.status(404).json({ error: 'Trade not found' });
      await transaction.rollback();
      return;
    }

    const parsed = updateTradeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      await transaction.rollback();
      return;
    }

    const updates = parsed.data;
    const previousValue = trade.toJSON();

    // Check which values are changing to create TradeUpdate audit records
    if (updates.stopLoss && updates.stopLoss !== Number(trade.stopLoss)) {
      await TradeUpdate.create({
        tradeId: trade.id,
        updateType: 'STOP_LOSS_UPDATE',
        oldValue: trade.stopLoss.toString(),
        newValue: updates.stopLoss.toString(),
        commentary: updates.commentary || 'Stop Loss adjusted by trader',
      }, { transaction });
    }

    if (updates.commentary && updates.commentary !== trade.commentary) {
      await TradeUpdate.create({
        tradeId: trade.id,
        updateType: 'COMMENTARY',
        oldValue: trade.commentary,
        newValue: updates.commentary,
        commentary: 'Commentary update',
      }, { transaction });
    }

    await trade.update(updates, { transaction });

    await logAudit({
      userId: req.user?.id,
      action: 'TRADE_UPDATED',
      resource: 'trades',
      previousValue,
      newValue: trade,
      ipAddress: req.ip,
    });

    // Notify assigned users about trade update
    const allocations = await SubscriptionTrade.findAll({
      where: { tradeId: trade.id },
      include: [{ model: Subscription }],
      transaction,
    });

    for (const alloc of allocations) {
      await Notification.create({
        userId: alloc.Subscription.userId,
        title: `Trade Update: ${trade.asset}`,
        message: `Trade signal ${trade.asset} was updated. Status: ${trade.status}. Commentary: ${updates.commentary || 'Review details in dashboard.'}`,
        type: 'TRADE_UPDATE',
      }, { transaction });
    }

    await transaction.commit();
    res.json(trade);
  } catch (error: any) {
    await transaction.rollback();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Close Trade (Manually close trade by Trader/Admin)
export const closeTrade = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, commentary } = req.body; // status should be CLOSED, TARGET_HIT, STOP_LOSS_HIT, or CANCELLED

    if (!['CLOSED', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CANCELLED'].includes(status)) {
      res.status(400).json({ error: 'Invalid closing status. Must be CLOSED, TARGET_HIT, STOP_LOSS_HIT, or CANCELLED' });
      await transaction.rollback();
      return;
    }

    const trade = await Trade.findByPk(id, { transaction });
    if (!trade) {
      res.status(404).json({ error: 'Trade not found' });
      await transaction.rollback();
      return;
    }

    const previousValue = trade.toJSON();
    await trade.update({ status, commentary }, { transaction });

    await TradeUpdate.create({
      tradeId: trade.id,
      updateType: 'CLOSED',
      oldValue: previousValue.status,
      newValue: status,
      commentary: commentary || `Trade closed manually. Status: ${status}`,
    }, { transaction });

    await logAudit({
      userId: req.user?.id,
      action: 'TRADE_CLOSED',
      resource: 'trades',
      previousValue,
      newValue: trade,
      ipAddress: req.ip,
    });

    // Notify subscribers
    const allocations = await SubscriptionTrade.findAll({
      where: { tradeId: trade.id },
      include: [{ model: Subscription }],
      transaction,
    });

    for (const alloc of allocations) {
      await Notification.create({
        userId: alloc.Subscription.userId,
        title: `Trade Closed: ${trade.asset}`,
        message: `Trade signal ${trade.asset} has been closed as ${status}. Outcome: ${commentary || 'Review in history.'}`,
        type: 'TRADE_CLOSED',
      }, { transaction });
    }

    await transaction.commit();
    res.json({ message: 'Trade closed successfully', trade });
  } catch (error: any) {
    await transaction.rollback();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Preview eligible subscribers before publishing
export const getEligibleSubscribers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const trade = await Trade.findByPk(id);
    if (!trade) {
      res.status(404).json({ error: 'Trade not found' });
      return;
    }

    const eligibleSubscriptions = await Subscription.findAll({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          [Op.gt]: new Date(),
        },
        remainingTrades: {
          [Op.gt]: 0,
        },
      },
      include: [
        {
          model: User,
          where: { status: 'ACTIVE' },
          attributes: ['id', 'email', 'fullName', 'mobile'],
        },
        {
          model: Plan,
          where: { accessTier: trade.accessTier },
          attributes: ['id', 'name', 'accessTier'],
        },
      ],
    });

    res.json({
      tradeId: trade.id,
      accessTier: trade.accessTier,
      eligibleCount: eligibleSubscriptions.length,
      subscribers: eligibleSubscriptions.map(sub => ({
        subscriptionId: sub.id,
        user: sub.User,
        plan: sub.Plan,
        remainingTrades: sub.remainingTrades,
        allowedTrades: sub.allowedTrades,
        expiryDate: sub.expiryDate,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Broadcast dedicated trade update with commentary to all assigned subscribers
export const broadcastTradeUpdate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { commentary, stopLoss, target1, updateType = 'COMMENTARY' } = req.body;

    if (!commentary) {
      res.status(400).json({ error: 'Commentary message is required for broadcast' });
      await transaction.rollback();
      return;
    }

    const trade = await Trade.findByPk(id, { transaction });
    if (!trade) {
      res.status(404).json({ error: 'Trade not found' });
      await transaction.rollback();
      return;
    }

    const previousValue = trade.toJSON();
    const updatePayload: any = { commentary };
    if (stopLoss) updatePayload.stopLoss = Number(stopLoss);
    if (target1) updatePayload.target1 = Number(target1);

    await trade.update(updatePayload, { transaction });

    await TradeUpdate.create({
      tradeId: trade.id,
      updateType,
      oldValue: previousValue.commentary || 'None',
      newValue: commentary,
      commentary,
    }, { transaction });

    await logAudit({
      userId: req.user?.id,
      action: 'TRADE_UPDATE_BROADCAST',
      resource: 'trades',
      previousValue,
      newValue: trade,
      ipAddress: req.ip,
    });

    // Notify all assigned subscribers
    const allocations = await SubscriptionTrade.findAll({
      where: { tradeId: trade.id },
      include: [{ model: Subscription, include: [{ model: User, attributes: ['email', 'fullName'] }] }],
      transaction,
    });

    for (const alloc of allocations) {
      await Notification.create({
        userId: alloc.Subscription.userId,
        title: `Live Update on ${trade.asset}`,
        message: commentary,
        type: 'TRADE_UPDATE',
      }, { transaction });

      console.log(`[Notification Mock] Broadcast update sent to ${alloc.Subscription.User?.email}: ${commentary}`);
    }

    await transaction.commit();
    res.json({ 
      message: `Broadcast update sent to ${allocations.length} subscribers successfully.`,
      trade,
      deliveredCount: allocations.length,
    });
  } catch (error: any) {
    await transaction.rollback();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Public summary for landing page live terminal feed
export const getPublicTradesSummary = async (req: any, res: Response): Promise<void> => {
  try {
    const totalSetups = await Trade.count({
      where: { status: ['PUBLISHED', 'ACTIVE', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED'] }
    });
    const activeCount = await Trade.count({ where: { status: 'ACTIVE' } });
    const successfulHits = await Trade.count({ where: { status: 'TARGET_HIT' } });
    const stopLossHits = await Trade.count({ where: { status: 'STOP_LOSS_HIT' } });

    const finishedCount = successfulHits + stopLossHits;
    const winRate = finishedCount > 0 ? `${((successfulHits / finishedCount) * 100).toFixed(1)}%` : (totalSetups > 0 ? '100.0%' : '0.0%');

    const recentSignals = await Trade.findAll({
      where: { status: ['ACTIVE', 'TARGET_HIT', 'PUBLISHED', 'CLOSED'] },
      attributes: ['id', 'asset', 'direction', 'entryPrice', 'target1', 'target2', 'stopLoss', 'status', 'riskLevel', 'accessTier', 'publishedAt'],
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: 6,
    });

    res.json({
      totalSetups,
      activeCount,
      successfulHits,
      stopLossHits,
      winRate,
      signals: recentSignals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch public trades' });
  }
};

