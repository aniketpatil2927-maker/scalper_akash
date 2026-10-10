import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import { sequelize } from './config/db';

// Route imports
import authRoutes from './routes/authRoutes';
import planRoutes from './routes/planRoutes';
import paymentRoutes from './routes/paymentRoutes';
import tradeRoutes from './routes/tradeRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import videoRoutes from './routes/videoRoutes';

// New Advanced Module Route imports
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import journalRoutes from './routes/journalRoutes';
import referralRoutes from './routes/referralRoutes';
import courseRoutes from './routes/courseRoutes';
import webinarRoutes from './routes/webinarRoutes';
import couponRoutes from './routes/couponRoutes';
import revenueRoutes from './routes/revenueRoutes';

// Scalper Akash V2 Ecosystem Routes
import playbookRoutes from './routes/playbookRoutes';
import toolRoutes from './routes/toolRoutes';
import traderScoreRoutes from './routes/traderScoreRoutes';
import communityRoutes from './routes/communityRoutes';
import mentorshipRoutes from './routes/mentorshipRoutes';
import strategyRoutes from './routes/strategyRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import crmRoutes from './routes/crmRoutes';
import blogRoutes from './routes/blogRoutes';

// Models import for expiry worker
import { Subscription, Notification } from './models/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
[uploadsDir, videosDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      !process.env.FRONTEND_URL ||
      allowedOrigins.includes(origin) ||
      origin === process.env.FRONTEND_URL ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve uploaded video and thumbnail static assets
app.use('/uploads', express.static(uploadsDir));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Production health check endpoints
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date(), service: 'Scalper Akash Ecosystem' });
});

// Bind routers
app.use('/api/auth', authRoutes);
app.use('/api', planRoutes);
app.use('/api', paymentRoutes);
app.use('/api', tradeRoutes);
app.use('/api', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', videoRoutes);

// Advanced Modules
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/revenue', revenueRoutes);

// Scalper Akash V2 Ecosystem Route Bindings
app.use('/api/playbooks', playbookRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/score', traderScoreRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/blog', blogRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Background Subscription Expiry Worker
async function checkSubscriptionExpirations() {
  console.log('[Worker] Checking for expired subscriptions...');
  try {
    const expiredCount = await Subscription.update(
      { status: 'EXPIRED' },
      {
        where: {
          status: 'ACTIVE',
          expiryDate: {
            [Op.lt]: new Date(),
          },
        },
      }
    );

    if (expiredCount[0] > 0) {
      console.log(`[Worker] Expired ${expiredCount[0]} active subscriptions.`);
    }
  } catch (error) {
    console.error('[Worker] Expiry check failed:', error);
  }
}

// Database Connection & Server Startup
async function startServer() {
  try {
    console.log('Testing MySQL Database connection...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: false });
    console.log('Sequelize Models synchronized.');

    const listenPort = Number(PORT);
    app.listen(listenPort, '0.0.0.0', () => {
      console.log(`========================================================`);
      console.log(`  SCALPER AKASH ECOSYSTEM SERVER RUNNING ON PORT ${listenPort} `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(`========================================================`);
    });

    // Run subscription expiry worker immediately and then hourly
    await checkSubscriptionExpirations();
    setInterval(checkSubscriptionExpirations, 60 * 60 * 1000);

  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    console.error('Ensure MySQL is running and credentials in backend/.env match.');
  }
}

startServer();
