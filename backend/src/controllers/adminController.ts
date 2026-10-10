import { Response } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import { sequelize } from '../config/db';
import { 
  User, 
  Subscription, 
  Order, 
  Payment, 
  Trade, 
  AuditLog, 
  Plan, 
  Invoice,
  Notification
} from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

// Admin dashboard KPI endpoint
export const getDashboardKPIs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.count();
    const activeSubscribers = await Subscription.count({ where: { status: 'ACTIVE' } });
    
    // Sum revenue
    const paymentsSum = await Payment.sum('amount', { where: { status: 'SUCCESS' } });
    const totalRevenue = Number(paymentsSum || 0);

    const activePlans = await Plan.count({ where: { isActive: true } });
    const tradesPublished = await Trade.count({ where: { status: ['PUBLISHED', 'ACTIVE', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED'] } });
    const activeTrades = await Trade.count({ where: { status: 'ACTIVE' } });
    const successfulTrades = await Trade.count({ where: { status: 'TARGET_HIT' } });
    const stoppedTrades = await Trade.count({ where: { status: 'STOP_LOSS_HIT' } });
    const expiredPlans = await Subscription.count({ where: { status: 'EXPIRED' } });
    const pendingPayments = await Order.count({ where: { status: 'PENDING' } });

    // Popular plans analysis
    const planPopularity = await Subscription.findAll({
      attributes: [
        'planId',
        [sequelize.fn('COUNT', sequelize.col('subscription.id')), 'subscribersCount'],
      ],
      include: [{ model: Plan, attributes: ['name', 'price', 'allowedTrades'] }],
      group: ['planId', 'Plan.id'],
    });

    res.json({
      kpis: {
        totalUsers,
        activeSubscribers,
        totalRevenue,
        activePlans,
        tradesPublished,
        activeTrades,
        successfulTrades,
        stoppedTrades,
        expiredPlans,
        pendingPayments,
      },
      planPopularity,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Search and list users
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['passwordHash', 'otpSecret'] },
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// View detailed user profile as admin
export const getUserDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash', 'otpSecret'] },
      include: [
        { model: Subscription, include: [{ model: Plan, attributes: ['name', 'accessTier'] }] },
        { model: Order, order: [['createdAt', 'DESC']] },
        { model: Invoice, order: [['createdAt', 'DESC']] },
      ],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Manually suspend/activate user
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Status must be ACTIVE or SUSPENDED' });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const previousValue = user.status;
    user.status = status;
    await user.save();

    await logAudit({
      userId: req.user?.id,
      action: status === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      resource: 'users',
      previousValue: { status: previousValue },
      newValue: { status },
      ipAddress: req.ip,
    });

    res.json({ message: `User status changed to ${status}`, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Manually assign plan
const assignPlanSchema = z.object({
  planId: z.number().int().positive(),
  validityDays: z.number().int().positive().optional(),
});

export const manuallyAssignPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; // userId
    const parsed = assignPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      await transaction.rollback();
      return;
    }

    const { planId, validityDays } = parsed.data;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      await transaction.rollback();
      return;
    }

    const plan = await Plan.findByPk(planId, { transaction });
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      await transaction.rollback();
      return;
    }

    const days = validityDays || plan.validityDays;
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + days);

    // Create manual Subscription
    const subscription = await Subscription.create({
      userId: user.id,
      planId: plan.id,
      status: 'ACTIVE',
      allowedTrades: plan.allowedTrades,
      usedTrades: 0,
      remainingTrades: plan.allowedTrades,
      startDate,
      expiryDate,
    }, { transaction });

    await Notification.create({
      userId: user.id,
      title: 'Subscription Assigned Manually',
      message: `Administrator has assigned ${plan.name} to your account. Credits: ${plan.allowedTrades}. Expiry: ${expiryDate.toLocaleDateString()}`,
      type: 'PLAN_ACTIVATED',
    }, { transaction });

    await logAudit({
      userId: req.user?.id,
      action: 'MANUAL_PLAN_ASSIGNED',
      resource: 'subscriptions',
      newValue: { subscriptionId: subscription.id, planId: plan.id, userId: user.id },
      ipAddress: req.ip,
    });

    await transaction.commit();
    res.json({ message: 'Plan assigned successfully', subscription });
  } catch (error: any) {
    await transaction.rollback();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Manually adjust trade credits (Add or subtract credits)
const adjustCreditsSchema = z.object({
  subscriptionId: z.number().int().positive(),
  actionType: z.enum(['ADD', 'SUBTRACT']),
  count: z.number().int().positive(),
  reason: z.string().min(3, 'Reason must be provided for credit adjustments'),
});

export const manuallyAdjustCredits = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; // userId
    const parsed = adjustCreditsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      await transaction.rollback();
      return;
    }

    const { subscriptionId, actionType, count, reason } = parsed.data;

    const sub = await Subscription.findOne({
      where: { id: subscriptionId, userId: id },
      transaction,
    });

    if (!sub) {
      res.status(404).json({ error: 'Subscription not found for this user' });
      await transaction.rollback();
      return;
    }

    const previousValue = {
      allowedTrades: sub.allowedTrades,
      remainingTrades: sub.remainingTrades,
    };

    if (actionType === 'ADD') {
      sub.allowedTrades += count;
      sub.remainingTrades += count;
    } else {
      if (sub.remainingTrades < count) {
        res.status(400).json({ error: `Cannot subtract ${count} credits. User only has ${sub.remainingTrades} remaining.` });
        await transaction.rollback();
        return;
      }
      sub.remainingTrades -= count;
    }

    await sub.save({ transaction });

    await Notification.create({
      userId: Number(id),
      title: 'Trade Credits Adjusted',
      message: `Your trade credits have been adjusted by the administrator. Action: ${actionType} ${count} credits. Reason: ${reason}`,
      type: 'CREDITS_ADJUSTED',
    }, { transaction });

    await logAudit({
      userId: req.user?.id,
      action: 'TRADE_CREDITS_ADJUSTED',
      resource: 'subscriptions',
      previousValue,
      newValue: {
        subscriptionId: sub.id,
        actionType,
        count,
        reason,
        allowedTrades: sub.allowedTrades,
        remainingTrades: sub.remainingTrades,
      },
      ipAddress: req.ip,
    });

    await transaction.commit();
    res.json({ message: 'Credits adjusted successfully', subscription: sub });
  } catch (error: any) {
    await transaction.rollback();
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Retrieve Audit Logs
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, attributes: ['fullName', 'email'] }],
      order: [['timestamp', 'DESC']],
      limit: 100,
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Broadcast System Announcement to Segments
export const broadcastAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, message, targetTier = 'ALL', type = 'ANNOUNCEMENT' } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: 'Title and message are required for broadcast' });
      return;
    }

    let targetUsers: User[] = [];

    if (targetTier === 'ALL') {
      targetUsers = await User.findAll({ where: { status: 'ACTIVE' } });
    } else {
      // Filter by active subscription tier
      const subs = await Subscription.findAll({
        where: { status: 'ACTIVE' },
        include: [{
          model: Plan,
          where: { accessTier: targetTier }
        }, {
          model: User,
          where: { status: 'ACTIVE' }
        }]
      });
      targetUsers = subs.map(s => s.User).filter(Boolean) as User[];
    }

    // Bulk create in-app notifications
    const notifications = await Promise.all(
      targetUsers.map(u => 
        Notification.create({
          userId: u.id,
          title,
          message,
          type: type as any,
          isRead: false
        })
      )
    );

    // Audit log
    await logAudit({
      userId: req.user?.id,
      action: 'BROADCAST_ANNOUNCEMENT',
      resource: 'notifications',
      newValue: { title, targetTier, recipientCount: targetUsers.length },
      ipAddress: req.ip
    });

    res.json({
      message: `Broadcast successfully dispatched to ${targetUsers.length} active users (${targetTier} tier).`,
      recipientCount: targetUsers.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to broadcast announcement' });
  }
};
