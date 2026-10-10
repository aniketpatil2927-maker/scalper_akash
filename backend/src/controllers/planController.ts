import { Response } from 'express';
import { z } from 'zod';
import { Plan, Subscription, User } from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

// Input validation schemas
const planSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  price: z.number().positive('Price must be positive'),
  promoPrice: z.number().positive('Promotional price must be positive').optional().nullable(),
  validityDays: z.number().int().positive('Validity must be a positive integer'),
  allowedTrades: z.number().int().positive('Allowed trades must be a positive integer'),
  accessTier: z.enum(['BASIC', 'PREMIUM', 'VIP']),
  features: z.array(z.string()),
  riskInfo: z.string().min(10, 'Risk info is too short'),
  isActive: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

// --- Public Endpoints ---
export const getPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const plans = await Plan.findAll({
      where: {
        isActive: true,
        isVisible: true,
      },
      order: [['price', 'ASC']],
    });
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getPlanById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// --- Client Subscription Endpoints ---
export const getSubscriptions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
      include: [{ model: Plan, attributes: ['name', 'accessTier', 'price'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(subscriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getSubscriptionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const subscription = await Subscription.findOne({
      where: { id, userId: req.user.id },
      include: [{ model: Plan, attributes: ['name', 'accessTier', 'price', 'features', 'riskInfo'] }],
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// --- Admin Endpoints ---
export const createPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const newPlan = await Plan.create(parsed.data);

    await logAudit({
      userId: req.user?.id,
      action: 'PLAN_CREATED',
      resource: 'plans',
      newValue: newPlan,
      ipAddress: req.ip,
    });

    res.status(201).json(newPlan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const updatePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const previousValue = plan.toJSON();
    await plan.update(parsed.data);

    await logAudit({
      userId: req.user?.id,
      action: 'PLAN_PRICE_CHANGED',
      resource: 'plans',
      previousValue,
      newValue: plan,
      ipAddress: req.ip,
    });

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const deletePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByPk(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Soft delete/deactivate plan
    const previousValue = plan.toJSON();
    plan.isActive = false;
    await plan.save();

    await logAudit({
      userId: req.user?.id,
      action: 'PLAN_DEACTIVATED',
      resource: 'plans',
      previousValue,
      newValue: plan,
      ipAddress: req.ip,
    });

    res.json({ message: 'Plan deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Admin: Get all plans including inactive and hidden
export const getAllPlansAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const plans = await Plan.findAll({
      order: [['price', 'ASC']],
    });
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Admin: Quick toggle status or visibility
export const togglePlanField = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { field } = req.body; // 'isActive' or 'isVisible'

    if (!['isActive', 'isVisible'].includes(field)) {
      res.status(400).json({ error: 'Invalid field to toggle' });
      return;
    }

    const plan = await Plan.findByPk(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const previousValue = plan.toJSON();
    if (field === 'isActive') {
      plan.isActive = !plan.isActive;
    } else if (field === 'isVisible') {
      plan.isVisible = !plan.isVisible;
    }

    await plan.save();

    await logAudit({
      userId: req.user?.id,
      action: `PLAN_${field.toUpperCase()}_TOGGLED`,
      resource: 'plans',
      previousValue,
      newValue: plan,
      ipAddress: req.ip,
    });

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
