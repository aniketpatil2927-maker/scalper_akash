import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { 
  Webinar, 
  WebinarRegistration, 
  Subscription, 
  Plan, 
  User, 
  AuditLog 
} from '../models/index';
import { Op } from 'sequelize';

export const getWebinars = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, accessType } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (accessType) where.accessType = accessType;

    const webinars = await Webinar.findAll({
      where,
      order: [['scheduledAt', 'ASC']],
      include: [{ model: WebinarRegistration, attributes: ['id', 'userId', 'status'] }],
    });

    const enriched = webinars.map(w => {
      const regs = (w as any).WebinarRegistrations || [];
      const confirmedCount = regs.filter((r: any) => r.status === 'CONFIRMED' || r.status === 'ATTENDED').length;
      const seatsRemaining = Math.max(0, w.capacity - confirmedCount);
      return {
        ...w.toJSON(),
        registeredCount: confirmedCount,
        seatsRemaining,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch webinars' });
  }
};

export const getWebinarBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const authHeader = req.headers.authorization;
    let userId: number | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_key_2026';
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
      } catch (e) {}
    }

    const webinar = await Webinar.findOne({
      where: { slug },
      include: [{ model: WebinarRegistration }],
    });

    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    const regs = (webinar as any).WebinarRegistrations || [];
    const registeredCount = regs.filter((r: any) => r.status === 'CONFIRMED' || r.status === 'ATTENDED').length;
    const seatsRemaining = Math.max(0, webinar.capacity - registeredCount);

    let isRegistered = false;
    let registration: any = null;

    if (userId) {
      registration = regs.find((r: any) => r.userId === userId);
      if (registration) isRegistered = true;
    }

    res.json({
      webinar,
      registeredCount,
      seatsRemaining,
      isRegistered,
      registration,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch webinar details' });
  }
};

export const registerWebinar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: webinarId } = req.params;

    const webinar = await Webinar.findByPk(webinarId);
    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    // Check capacity
    const currentRegs = await WebinarRegistration.count({
      where: { webinarId: webinar.id, status: { [Op.in]: ['CONFIRMED', 'ATTENDED'] } },
    });

    if (currentRegs >= webinar.capacity) {
      res.status(400).json({ error: 'This webinar has reached full capacity. No seats available.' });
      return;
    }

    // Check if already registered
    const existing = await WebinarRegistration.findOne({
      where: { webinarId: webinar.id, userId },
    });

    if (existing) {
      res.json({ message: 'Already registered for this masterclass', registration: existing });
      return;
    }

    // Check tier / access rules
    let canRegister = webinar.accessType === 'PUBLIC' || Number(webinar.price) === 0;

    if (!canRegister) {
      const activeSub = await Subscription.findOne({
        where: { userId, status: 'ACTIVE' },
        include: [{ model: Plan }],
      });

      if (activeSub && activeSub.Plan) {
        const tier = activeSub.Plan.accessTier;
        if (webinar.accessType === 'SUBSCRIBER_ONLY') canRegister = true;
        else if (webinar.accessType === 'VIP_ONLY' && tier === 'VIP') canRegister = true;
      }
    }

    if (!canRegister && webinar.accessType === 'PAID') {
      res.status(402).json({ 
        error: 'Payment required to register for this live masterclass. Please complete checkout.',
        requiresPayment: true,
      });
      return;
    }

    const reg = await WebinarRegistration.create({
      webinarId: webinar.id,
      userId,
      status: 'CONFIRMED',
    });

    res.status(201).json({ message: 'Seat reserved successfully!', registration: reg });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register for webinar' });
  }
};

export const getMyWebinars = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const registrations = await WebinarRegistration.findAll({
      where: { userId },
      include: [{ model: Webinar }],
      order: [['registeredAt', 'DESC']],
    });

    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch my webinars' });
  }
};

// ============================================================================
// ADMIN WEBINAR MANAGEMENT
// ============================================================================

export const createWebinarAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      speaker = 'Scalper Akash',
      thumbnailUrl,
      scheduledAt,
      endTime,
      timezone = 'IST (UTC+5:30)',
      price = 0.00,
      discountPrice,
      capacity = 250,
      meetingUrl,
      accessType = 'PAID',
      status = 'SCHEDULED',
      recordingUrl,
      recordingAccessDays = 30,
    } = req.body;

    const webSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const webinar = await Webinar.create({
      title,
      slug: webSlug,
      shortDescription,
      description,
      speaker,
      thumbnailUrl,
      scheduledAt,
      endTime,
      timezone,
      price,
      discountPrice,
      capacity,
      meetingUrl,
      accessType,
      status,
      recordingUrl,
      recordingAccessDays,
    });

    await AuditLog.create({
      userId: req.user!.id,
      action: 'WEBINAR_CREATED',
      resource: 'webinars',
      previousValue: null,
      newValue: JSON.stringify({ webinarId: webinar.id, title }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(webinar);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create webinar' });
  }
};

export const updateWebinarAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByPk(id);
    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    await webinar.update(req.body);

    await AuditLog.create({
      userId: req.user!.id,
      action: 'WEBINAR_UPDATED',
      resource: 'webinars',
      previousValue: null,
      newValue: JSON.stringify({ webinarId: id, updates: req.body }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(webinar);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update webinar' });
  }
};

export const deleteWebinarAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByPk(id);
    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    await webinar.destroy();

    await AuditLog.create({
      userId: req.user!.id,
      action: 'WEBINAR_DELETED',
      resource: 'webinars',
      previousValue: JSON.stringify({ webinarId: id, title: webinar.title }),
      newValue: null,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ message: 'Webinar deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete webinar' });
  }
};

export const attachRecordingAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { recordingUrl, recordingAccessDays = 30 } = req.body;

    const webinar = await Webinar.findByPk(id);
    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    webinar.recordingUrl = recordingUrl;
    webinar.recordingAccessDays = recordingAccessDays;
    webinar.status = 'COMPLETED';
    await webinar.save();

    await AuditLog.create({
      userId: req.user!.id,
      action: 'RECORDING_ATTACHED',
      resource: 'webinars',
      previousValue: null,
      newValue: JSON.stringify({ webinarId: id, recordingUrl }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(webinar);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to attach recording' });
  }
};

export const getAdminWebinarAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalWebinars = await Webinar.count();
    const upcomingWebinars = await Webinar.count({ where: { status: 'SCHEDULED' } });
    const completedWebinars = await Webinar.count({ where: { status: 'COMPLETED' } });
    const totalRegistrations = await WebinarRegistration.count();

    const webinars = await Webinar.findAll({
      include: [{ model: WebinarRegistration }],
      order: [['scheduledAt', 'DESC']],
    });

    const webinarStats = webinars.map(w => ({
      id: w.id,
      title: w.title,
      scheduledAt: w.scheduledAt,
      price: w.price,
      capacity: w.capacity,
      status: w.status,
      registrations: (w as any).WebinarRegistrations?.length || 0,
      hasRecording: !!w.recordingUrl,
    }));

    res.json({
      totalWebinars,
      upcomingWebinars,
      completedWebinars,
      totalRegistrations,
      webinarStats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch webinar analytics' });
  }
};
