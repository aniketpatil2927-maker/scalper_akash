import { Request, Response } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { VideoSession, Subscription, Plan, User, Role } from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

// Multer Storage Configuration for Device Video and Thumbnail Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|mkv|webm|mov|avi)$/i.test(file.originalname);
    const destDir = isVideo 
      ? path.join(__dirname, '../../uploads/videos')
      : path.join(__dirname, '../../uploads/thumbnails');
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

export const uploadMediaMiddleware = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB max limit
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_key_2026';


// Zod Schema for Video Session Creation & Update
const videoSessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().nullable(),
  videoUrl: z.string().min(5, 'Valid Video URL is required'),
  thumbnailUrl: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  category: z.string().min(2, 'Category is required'),
  accessType: z.enum(['ALL_MEMBERS', 'PLAN_MEMBERS']).default('ALL_MEMBERS'),
  requiredTier: z.enum(['BASIC', 'PREMIUM', 'VIP']).default('BASIC'),
  allowedPlanIds: z.array(z.number()).optional().nullable(),
  instructor: z.string().default('Scalper Akash'),
  sessionDate: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
  resourceUrls: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    })
  ).optional().nullable(),
});

// Helper: Determine tier rank for hierarchy comparison
const tierRank: Record<string, number> = {
  BASIC: 1,
  PREMIUM: 2,
  VIP: 3,
};

// Helper: Extract user optionally from token without hard failure
const getOptionalUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
        },
        {
          model: Subscription,
          where: { status: 'ACTIVE' },
          required: false,
          include: [{ model: Plan }],
        },
      ],
    });
    return user;
  } catch (err) {
    return null;
  }
};

// --- Member / Public Endpoints ---

// 1. Get All Published Videos with User-Specific Lock Evaluation
export const getAllVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, accessType, search, tier, sort } = req.query;
    const currentUser = await getOptionalUser(req);

    // Check user roles
    const userRoles = currentUser ? (currentUser as any).Roles?.map((r: any) => r.name) || [] : [];
    const isStaff = userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'TRADER'].includes(r));

    // Check user active subscription
    const activeSubs = currentUser ? (currentUser as any).Subscriptions || [] : [];
    const activePlanIds = activeSubs.map((s: any) => s.planId);
    const highestActiveTier = activeSubs.reduce((max: number, s: any) => {
      const rank = tierRank[s.Plan?.accessTier || 'BASIC'] || 1;
      return rank > max ? rank : max;
    }, 0);

    const whereClause: any = {
      isPublished: true,
    };

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (accessType && accessType !== 'ALL') {
      whereClause.accessType = accessType;
    }

    if (tier && tier !== 'ALL') {
      whereClause.requiredTier = tier;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { instructor: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }

    let orderClause: any = [['sessionDate', 'DESC'], ['createdAt', 'DESC']];
    if (sort === 'POPULAR') {
      orderClause = [['viewsCount', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'OLDEST') {
      orderClause = [['sessionDate', 'ASC'], ['createdAt', 'ASC']];
    }

    const videos = await VideoSession.findAll({
      where: whereClause,
      order: orderClause,
    });

    // Format output with lock evaluation
    const formatted = videos.map((v) => {
      const vData = v.toJSON() as any;
      let isLocked = false;
      let lockReason = '';

      if (vData.accessType === 'PLAN_MEMBERS') {
        if (isStaff) {
          isLocked = false;
        } else if (activeSubs.length === 0) {
          isLocked = true;
          lockReason = `Requires an active ${vData.requiredTier || 'VIP'} subscription plan`;
        } else {
          // Check if specific plan ID matched OR tier satisfies
          const allowedPlans: number[] = Array.isArray(vData.allowedPlanIds) ? vData.allowedPlanIds : [];
          const hasSpecificPlan = allowedPlans.length > 0 && allowedPlans.some(pId => activePlanIds.includes(pId));
          const reqRank = tierRank[vData.requiredTier || 'BASIC'] || 1;
          const meetsTier = highestActiveTier >= reqRank;

          if (hasSpecificPlan || (allowedPlans.length === 0 && meetsTier) || meetsTier) {
            isLocked = false;
          } else {
            isLocked = true;
            lockReason = `Requires ${vData.requiredTier} Plan or above`;
          }
        }
      }

      return {
        ...vData,
        isLocked,
        lockReason,
        // If locked, we don't expose raw direct stream URL to unauthorized clients
        videoUrl: isLocked ? null : vData.videoUrl,
      };
    });

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch video sessions' });
  }
};

// 2. Get Single Video by ID
export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = await getOptionalUser(req);

    const video = await VideoSession.findByPk(id);
    if (!video) {
      res.status(404).json({ error: 'Video session not found' });
      return;
    }

    const vData = video.toJSON() as any;
    const userRoles = currentUser ? (currentUser as any).Roles?.map((r: any) => r.name) || [] : [];
    const isStaff = userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'TRADER'].includes(r));

    const activeSubs = currentUser ? (currentUser as any).Subscriptions || [] : [];
    const activePlanIds = activeSubs.map((s: any) => s.planId);
    const highestActiveTier = activeSubs.reduce((max: number, s: any) => {
      const rank = tierRank[s.Plan?.accessTier || 'BASIC'] || 1;
      return rank > max ? rank : max;
    }, 0);

    let isLocked = false;
    let lockReason = '';

    if (vData.accessType === 'PLAN_MEMBERS') {
      if (isStaff) {
        isLocked = false;
      } else if (activeSubs.length === 0) {
        isLocked = true;
        lockReason = `Requires an active ${vData.requiredTier || 'VIP'} plan subscription to watch`;
      } else {
        const allowedPlans: number[] = Array.isArray(vData.allowedPlanIds) ? vData.allowedPlanIds : [];
        const hasSpecificPlan = allowedPlans.length > 0 && allowedPlans.some(pId => activePlanIds.includes(pId));
        const reqRank = tierRank[vData.requiredTier || 'BASIC'] || 1;
        const meetsTier = highestActiveTier >= reqRank;

        if (hasSpecificPlan || (allowedPlans.length === 0 && meetsTier) || meetsTier) {
          isLocked = false;
        } else {
          isLocked = true;
          lockReason = `Your current plan does not include access to this ${vData.requiredTier} session. Please upgrade your plan.`;
        }
      }
    }

    res.json({
      ...vData,
      isLocked,
      lockReason,
      videoUrl: isLocked ? null : vData.videoUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// 3. Increment Video Views
export const recordVideoView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await VideoSession.increment('viewsCount', { where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update view count' });
  }
};

// --- Admin Endpoints ---

// 4. Admin: Get All Video Sessions (With drafts, filters, and stats)
export const adminGetVideos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, accessType, status, sort } = req.query;

    const whereClause: any = {};

    if (status === 'PUBLISHED') {
      whereClause.isPublished = true;
    } else if (status === 'DRAFT') {
      whereClause.isPublished = false;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (accessType && accessType !== 'ALL') {
      whereClause.accessType = accessType;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { instructor: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }

    let orderClause: any = [['sessionDate', 'DESC'], ['createdAt', 'DESC']];
    if (sort === 'VIEWS') {
      orderClause = [['viewsCount', 'DESC']];
    } else if (sort === 'OLDEST') {
      orderClause = [['createdAt', 'ASC']];
    }

    const videos = await VideoSession.findAll({
      where: whereClause,
      order: orderClause,
    });

    res.json(videos);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// 5. Admin: Get Video Analytics & KPI Stats
export const adminGetVideoStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalVideos = await VideoSession.count();
    const allMembersVideos = await VideoSession.count({ where: { accessType: 'ALL_MEMBERS' } });
    const planExclusiveVideos = await VideoSession.count({ where: { accessType: 'PLAN_MEMBERS' } });
    const publishedVideos = await VideoSession.count({ where: { isPublished: true } });
    const draftVideos = await VideoSession.count({ where: { isPublished: false } });
    const totalViews = (await VideoSession.sum('viewsCount')) || 0;

    // Distinct categories
    const categories = await VideoSession.findAll({
      attributes: ['category'],
      group: ['category'],
    });

    res.json({
      totalVideos,
      allMembersVideos,
      planExclusiveVideos,
      publishedVideos,
      draftVideos,
      totalViews,
      categoriesCount: categories.length,
      categoriesList: categories.map(c => c.category),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// 6. Admin: Create Video Session
export const adminCreateVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = videoSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const payload = parsed.data;

    const video = await VideoSession.create({
      title: payload.title,
      description: payload.description || null,
      videoUrl: payload.videoUrl,
      thumbnailUrl: payload.thumbnailUrl || null,
      duration: payload.duration || '45m',
      category: payload.category || 'Live Trading',
      accessType: payload.accessType,
      requiredTier: payload.requiredTier,
      allowedPlanIds: payload.allowedPlanIds || [],
      instructor: payload.instructor || 'Scalper Akash',
      sessionDate: payload.sessionDate ? new Date(payload.sessionDate) : new Date(),
      isPublished: payload.isPublished ?? true,
      resourceUrls: payload.resourceUrls || [],
    });

    await logAudit({
      userId: req.user?.id,
      action: 'VIDEO_SESSION_CREATED',
      resource: `video_sessions:${video.id}`,
      newValue: video.toJSON(),
      ipAddress: req.ip,
    });

    res.status(201).json(video);
  } catch (error: any) {
    console.error('Create video error:', error);
    res.status(500).json({ error: error.message || 'Failed to create video session' });
  }
};

// 7. Admin: Update Video Session
export const adminUpdateVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await VideoSession.findByPk(id);
    if (!video) {
      res.status(404).json({ error: 'Video session not found' });
      return;
    }

    const parsed = videoSessionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const prevValue = video.toJSON();
    const updateData: any = { ...parsed.data };
    if (updateData.sessionDate) {
      updateData.sessionDate = new Date(updateData.sessionDate);
    }

    await video.update(updateData);

    await logAudit({
      userId: req.user?.id,
      action: 'VIDEO_SESSION_UPDATED',
      resource: `video_sessions:${video.id}`,
      previousValue: prevValue,
      newValue: video.toJSON(),
      ipAddress: req.ip,
    });

    res.json(video);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update video session' });
  }
};

// 8. Admin: Delete Video Session
export const adminDeleteVideo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await VideoSession.findByPk(id);
    if (!video) {
      res.status(404).json({ error: 'Video session not found' });
      return;
    }

    const prevValue = video.toJSON();
    await video.destroy();

    await logAudit({
      userId: req.user?.id,
      action: 'VIDEO_SESSION_DELETED',
      resource: `video_sessions:${id}`,
      previousValue: prevValue,
      ipAddress: req.ip,
    });

    res.json({ message: 'Video session deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete video session' });
  }
};

// 9. Admin: Direct Device File Upload (Video & Thumbnail)
export const adminUploadMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded from device' });
      return;
    }

    const isVideo = req.file.mimetype.startsWith('video/') || /\.(mp4|mkv|webm|mov|avi)$/i.test(req.file.originalname);
    const subfolder = isVideo ? 'videos' : 'thumbnails';
    
    // Construct accessible absolute/relative media URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${subfolder}/${req.file.filename}`;

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: isVideo ? 'video' : 'thumbnail',
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload media file' });
  }
};

