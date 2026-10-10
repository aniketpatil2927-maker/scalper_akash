import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { 
  Order, 
  Payment, 
  Subscription, 
  ReferralCommission, 
  CourseEnrollment, 
  WebinarRegistration, 
  User 
} from '../models/index';
import { Op } from 'sequelize';

export const getAdminRevenueAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch all completed/paid orders with user relation
    const paidOrders = await Order.findAll({
      where: { status: 'PAID' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
    });

    const totalRevenue = paidOrders.reduce((acc, curr) => acc + Number(curr.finalAmount), 0);

    const subscriptionOrders = paidOrders.filter(o => o.orderType === 'SUBSCRIPTION');
    const courseOrders = paidOrders.filter(o => o.orderType === 'COURSE');
    const webinarOrders = paidOrders.filter(o => o.orderType === 'WEBINAR');

    const subscriptionRevenue = subscriptionOrders.reduce((acc, curr) => acc + Number(curr.finalAmount), 0);
    const courseRevenue = courseOrders.reduce((acc, curr) => acc + Number(curr.finalAmount), 0);
    const webinarRevenue = webinarOrders.reduce((acc, curr) => acc + Number(curr.finalAmount), 0);

    // 2. Referral commissions & costs
    const totalCommissions = (await ReferralCommission.sum('commissionAmount')) || 0;
    const paidCommissions = (await ReferralCommission.sum('commissionAmount', { where: { status: 'PAID' } })) || 0;
    const pendingCommissions = (await ReferralCommission.sum('commissionAmount', { where: { status: 'PENDING' } })) || 0;

    const netRevenue = Math.max(0, totalRevenue - totalCommissions);

    // 3. Subscriptions, Users, MRR & ARR calculation
    const activeSubsCount = await Subscription.count({ where: { status: 'ACTIVE' } });
    const totalUsersCount = await User.count();

    // MRR is based on active subscriptions or 30-day recurring subscription revenue
    const mrr = subscriptionRevenue > 0 ? Math.round(subscriptionRevenue) : 0;
    const arr = mrr * 12;
    const arpu = totalUsersCount > 0 ? (totalRevenue / totalUsersCount).toFixed(2) : '0';

    // 4. Dynamic Monthly Trend Generation from Real Database Orders (Past 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyRevenueTrend: Array<{
      month: string;
      subscriptions: number;
      courses: number;
      webinars: number;
      total: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth();
      const label = `${monthNames[mMonth]} ${mYear === now.getFullYear() ? '' : mYear}`.trim();

      const ordersInMonth = paidOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getFullYear() === mYear && orderDate.getMonth() === mMonth;
      });

      const subSum = ordersInMonth.filter(o => o.orderType === 'SUBSCRIPTION').reduce((acc, curr) => acc + Number(curr.finalAmount), 0);
      const courseSum = ordersInMonth.filter(o => o.orderType === 'COURSE').reduce((acc, curr) => acc + Number(curr.finalAmount), 0);
      const webSum = ordersInMonth.filter(o => o.orderType === 'WEBINAR').reduce((acc, curr) => acc + Number(curr.finalAmount), 0);

      monthlyRevenueTrend.push({
        month: label,
        subscriptions: subSum,
        courses: courseSum,
        webinars: webSum,
        total: subSum + courseSum + webSum,
      });
    }

    // 5. Dynamic Revenue Breakdown by Product
    const productBreakdown = [
      { name: 'Signals Subscriptions', value: subscriptionRevenue, color: '#d2fd2a' },
      { name: 'Paid Courses', value: courseRevenue, color: '#8b5cf6' },
      { name: 'Live Webinars', value: webinarRevenue, color: '#06b6d4' },
    ];

    res.json({
      totalRevenue,
      netRevenue,
      subscriptionRevenue,
      courseRevenue,
      webinarRevenue,
      mrr,
      arr,
      arpu: Number(arpu),
      activeSubscribers: activeSubsCount,
      totalOrdersCount: paidOrders.length,
      referralCommissions: {
        total: totalCommissions,
        paid: paidCommissions,
        pending: pendingCommissions,
      },
      monthlyRevenueTrend,
      productBreakdown,
      recentTransactions: paidOrders.slice(0, 10),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch revenue analytics' });
  }
};
