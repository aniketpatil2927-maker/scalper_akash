import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { 
  Referral, 
  ReferralCommission, 
  ReferralPayout, 
  ReferralProgram, 
  User, 
  Order, 
  AuditLog 
} from '../models/index';
import { Op } from 'sequelize';

export const getReferralDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Ensure user has a referral code
    let refCode = user.referralCode;
    if (!refCode) {
      refCode = `REF${user.id}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      user.referralCode = refCode;
      await user.save();
    }

    // Get referral program config
    const program = await ReferralProgram.findOne({ where: { isActive: true } });

    // Fetch referrals
    const referrals = await Referral.findAll({
      where: { referrerId: userId },
      include: [
        {
          model: User,
          as: 'ReferredUser',
          attributes: ['id', 'fullName', 'email', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const totalRegistrations = referrals.length;
    const totalConversions = referrals.filter(r => r.status === 'CONVERTED').length;
    const conversionRate = totalRegistrations > 0 ? ((totalConversions / totalRegistrations) * 100).toFixed(1) : '0.0';

    // Fetch commissions
    const commissions = await ReferralCommission.findAll({
      where: { referrerId: userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Order, attributes: ['id', 'orderType', 'finalAmount', 'createdAt'] }],
    });

    const pendingCommission = commissions
      .filter(c => c.status === 'PENDING')
      .reduce((acc, curr) => acc + Number(curr.commissionAmount), 0);

    const approvedCommission = commissions
      .filter(c => c.status === 'APPROVED')
      .reduce((acc, curr) => acc + Number(curr.commissionAmount), 0);

    const paidCommission = commissions
      .filter(c => c.status === 'PAID')
      .reduce((acc, curr) => acc + Number(curr.commissionAmount), 0);

    const totalEarnings = approvedCommission + paidCommission;

    // Available for payout request
    const availableForPayout = approvedCommission;

    const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    res.json({
      referralCode: refCode,
      referralLink: `${frontendBaseUrl}/register?ref=${refCode}`,
      stats: {
        clicks: totalRegistrations,
        registrations: totalRegistrations,
        conversions: totalConversions,
        conversionRate: Number(conversionRate),
        pendingCommission,
        approvedCommission,
        paidCommission,
        totalEarnings,
        availableForPayout,
        minPayoutAmount: program ? Number(program.minPayoutAmount) : 1000,
      },
      referrals,
      commissions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch referral dashboard' });
  }
};

export const getUserCommissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const commissions = await ReferralCommission.findAll({
      where: { referrerId: userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Order }],
    });
    res.json(commissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch commissions' });
  }
};

export const requestPayout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount, paymentMethod = 'UPI', accountDetails } = req.body;

    if (!amount || Number(amount) <= 0 || !accountDetails) {
      res.status(400).json({ error: 'Valid payout amount and account details are required.' });
      return;
    }

    const requestedAmount = Number(amount);

    // Verify program min payout
    const program = await ReferralProgram.findOne({ where: { isActive: true } });
    const minPayout = program ? Number(program.minPayoutAmount) : 1000;

    if (requestedAmount < minPayout) {
      res.status(400).json({ error: `Minimum payout threshold is ₹${minPayout.toLocaleString('en-IN')}` });
      return;
    }

    // Verify available approved commission
    const approvedCommissions = await ReferralCommission.findAll({
      where: { referrerId: userId, status: 'APPROVED' },
    });

    const totalApproved = approvedCommissions.reduce((acc, curr) => acc + Number(curr.commissionAmount), 0);

    // Also deduct any already pending requested payouts
    const pendingPayouts = await ReferralPayout.findAll({
      where: {
        referrerId: userId,
        status: { [Op.in]: ['REQUESTED', 'UNDER_REVIEW'] },
      },
    });

    const totalInReview = pendingPayouts.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const availableBalance = totalApproved - totalInReview;

    if (requestedAmount > availableBalance) {
      res.status(400).json({ 
        error: `Insufficient approved balance. Available: ₹${availableBalance.toLocaleString('en-IN')}, Requested: ₹${requestedAmount.toLocaleString('en-IN')}` 
      });
      return;
    }

    const payout = await ReferralPayout.create({
      referrerId: userId,
      amount: requestedAmount,
      paymentMethod,
      accountDetails,
      status: 'REQUESTED',
    });

    // Create Audit Log
    await AuditLog.create({
      userId,
      action: 'PAYOUT_REQUESTED',
      resource: 'referral_payouts',
      previousValue: null,
      newValue: JSON.stringify({ payoutId: payout.id, amount: requestedAmount, method: paymentMethod }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(payout);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit payout request' });
  }
};

// ============================================================================
// ADMIN AFFILIATE CONTROLLERS
// ============================================================================

export const getAdminReferralOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalAffiliates = await User.count({ where: { referralCode: { [Op.ne]: null } } });
    const totalReferrals = await Referral.count();
    const convertedReferrals = await Referral.count({ where: { status: 'CONVERTED' } });
    const totalCommissions = await ReferralCommission.sum('commissionAmount') || 0;
    const pendingCommissions = await ReferralCommission.sum('commissionAmount', { where: { status: 'PENDING' } }) || 0;
    const paidCommissions = await ReferralCommission.sum('commissionAmount', { where: { status: 'PAID' } }) || 0;

    res.json({
      totalAffiliates,
      totalReferrals,
      convertedReferrals,
      conversionRate: totalReferrals > 0 ? ((convertedReferrals / totalReferrals) * 100).toFixed(1) : '0.0',
      totalCommissions,
      pendingCommissions,
      paidCommissions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin referral overview' });
  }
};

export const getAdminAffiliates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const affiliates = await User.findAll({
      where: { referralCode: { [Op.ne]: null } },
      attributes: ['id', 'fullName', 'email', 'mobile', 'referralCode', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    const enriched = await Promise.all(
      affiliates.map(async (u) => {
        const refs = await Referral.count({ where: { referrerId: u.id } });
        const convs = await Referral.count({ where: { referrerId: u.id, status: 'CONVERTED' } });
        const earned = await ReferralCommission.sum('commissionAmount', { where: { referrerId: u.id } }) || 0;
        return {
          ...u.toJSON(),
          referralsCount: refs,
          conversionsCount: convs,
          totalEarned: earned,
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch affiliates list' });
  }
};

export const getAdminCommissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const commissions = await ReferralCommission.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'Referrer', attributes: ['id', 'fullName', 'email', 'referralCode'] },
        { model: Order, attributes: ['id', 'orderType', 'finalAmount', 'createdAt'] },
      ],
    });

    res.json(commissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin commissions' });
  }
};

export const updateCommissionStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED', 'REVERSED', 'CANCELLED'

    const commission = await ReferralCommission.findByPk(id);
    if (!commission) {
      res.status(404).json({ error: 'Commission not found' });
      return;
    }

    const oldStatus = commission.status;
    commission.status = status;
    await commission.save();

    await AuditLog.create({
      userId: req.user!.id,
      action: 'COMMISSION_STATUS_UPDATED',
      resource: 'referral_commissions',
      previousValue: JSON.stringify({ commissionId: id, status: oldStatus }),
      newValue: JSON.stringify({ commissionId: id, status }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(commission);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update commission status' });
  }
};

export const getAdminPayouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const payouts = await ReferralPayout.findAll({
      where,
      order: [['requestedAt', 'DESC']],
      include: [{ model: User, as: 'Referrer', attributes: ['id', 'fullName', 'email', 'mobile'] }],
    });

    res.json(payouts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch payouts' });
  }
};

export const processPayout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, transactionRef, adminNotes } = req.body; // 'APPROVED', 'PAID', 'REJECTED'

    const payout = await ReferralPayout.findByPk(id);
    if (!payout) {
      res.status(404).json({ error: 'Payout not found' });
      return;
    }

    const oldStatus = payout.status;
    payout.status = status;
    if (transactionRef) payout.transactionRef = transactionRef;
    if (adminNotes) payout.adminNotes = adminNotes;
    if (status === 'PAID') payout.processedAt = new Date();

    await payout.save();

    // If marked PAID, update corresponding approved commissions to PAID status
    if (status === 'PAID') {
      await ReferralCommission.update(
        { status: 'PAID' },
        { where: { referrerId: payout.referrerId, status: 'APPROVED' } }
      );
    }

    await AuditLog.create({
      userId: req.user!.id,
      action: 'PAYOUT_PROCESSED',
      resource: 'referral_payouts',
      previousValue: JSON.stringify({ payoutId: id, status: oldStatus }),
      newValue: JSON.stringify({ payoutId: id, status, transactionRef }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(payout);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process payout' });
  }
};

export const getProgramConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let program = await ReferralProgram.findOne({ where: { isActive: true } });
    if (!program) {
      program = await ReferralProgram.create({
        name: 'Scalper Akash Partner Program',
        commissionType: 'PERCENTAGE',
        defaultCommissionRate: 15.00,
        tierRates: { BASIC: 10.0, PREMIUM: 15.0, VIP: 20.0 },
        minPayoutAmount: 1000.00,
        holdingPeriodDays: 7,
      });
    }
    res.json(program);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch program config' });
  }
};

export const updateProgramConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, commissionType, defaultCommissionRate, tierRates, minPayoutAmount, holdingPeriodDays } = req.body;
    let program = await ReferralProgram.findOne({ where: { isActive: true } });

    if (!program) {
      program = await ReferralProgram.create({
        name,
        commissionType,
        defaultCommissionRate,
        tierRates,
        minPayoutAmount,
        holdingPeriodDays,
      });
    } else {
      if (name) program.name = name;
      if (commissionType) program.commissionType = commissionType;
      if (defaultCommissionRate !== undefined) program.defaultCommissionRate = defaultCommissionRate;
      if (tierRates) program.tierRates = tierRates;
      if (minPayoutAmount !== undefined) program.minPayoutAmount = minPayoutAmount;
      if (holdingPeriodDays !== undefined) program.holdingPeriodDays = holdingPeriodDays;
      await program.save();
    }

    await AuditLog.create({
      userId: req.user!.id,
      action: 'REFERRAL_PROGRAM_UPDATED',
      resource: 'referral_programs',
      previousValue: null,
      newValue: JSON.stringify(program.toJSON()),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(program);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update program config' });
  }
};
