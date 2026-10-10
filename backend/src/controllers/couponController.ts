import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Coupon, CouponRedemption, AuditLog } from '../models/index';
import { Op } from 'sequelize';

export const validateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, productType = 'SUBSCRIPTION', amount } = req.body;
    const userId = req.user!.id;

    if (!code || !amount) {
      res.status(400).json({ error: 'Coupon code and order amount are required' });
      return;
    }

    const coupon = await Coupon.findOne({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
        validFrom: { [Op.lte]: new Date() },
        validUntil: { [Op.gte]: new Date() },
      },
    });

    if (!coupon) {
      res.status(404).json({ error: 'Invalid, inactive, or expired coupon code.' });
      return;
    }

    // Check usage limits
    if (coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ error: 'Coupon usage limit has been reached.' });
      return;
    }

    // Check product applicability
    if (coupon.appliesTo !== 'ALL' && coupon.appliesTo !== productType) {
      res.status(400).json({ error: `This coupon is only valid for ${coupon.appliesTo.toLowerCase()} products.` });
      return;
    }

    const orderAmount = Number(amount);
    if (orderAmount < Number(coupon.minOrderAmount)) {
      res.status(400).json({ 
        error: `Minimum order amount of ₹${Number(coupon.minOrderAmount).toLocaleString('en-IN')} required to use this coupon.` 
      });
      return;
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    discount = Math.min(discount, orderAmount);
    const finalAmount = Math.max(0, orderAmount - discount);

    res.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: Number(discount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to validate coupon' });
  }
};

export const getAdminCoupons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch coupons' });
  }
};

export const createAdminCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      code,
      discountType = 'PERCENTAGE',
      discountValue,
      minOrderAmount = 0,
      maxDiscount,
      appliesTo = 'ALL',
      usageLimit = 1000,
      validFrom = new Date(),
      validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive = true,
    } = req.body;

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      appliesTo,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
    });

    await AuditLog.create({
      userId: req.user!.id,
      action: 'COUPON_CREATED',
      resource: 'coupons',
      previousValue: null,
      newValue: JSON.stringify({ couponId: coupon.id, code: coupon.code }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create coupon' });
  }
};

export const updateAdminCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    await coupon.update(req.body);

    await AuditLog.create({
      userId: req.user!.id,
      action: 'COUPON_UPDATED',
      resource: 'coupons',
      previousValue: null,
      newValue: JSON.stringify({ couponId: id, updates: req.body }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update coupon' });
  }
};
