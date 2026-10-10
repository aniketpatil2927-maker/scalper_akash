import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, Role } from '../models/index';
import { AuthenticatedRequest } from '../middlewares/auth';
import { logAudit } from '../utils/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_key_2026';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');

// Zod schemas for input validation
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { fullName, mobile, email, password, referralCode } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate static OTP for local developer ease or random 6 digits
    // The prompt says "otp verification", we will generate a random 6-digit OTP
    const otpSecret = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create user in transaction
    const newUser = await User.create({
      fullName,
      mobile,
      email,
      passwordHash,
      status: 'PENDING_OTP',
      referralCode: referralCode || null,
      otpSecret,
      otpExpiresAt,
      otpVerified: false,
    });

    // Assign USER role
    const userRole = await Role.findOne({ where: { name: 'USER' } });
    if (userRole) {
      await (newUser as any).addRole(userRole);
    }

    await logAudit({
      action: 'USER_REGISTERED',
      resource: 'users',
      newValue: { id: newUser.id, email: newUser.email },
      ipAddress: req.ip,
    });

    // Send code back to client in response for testing convenience.
    // In production, this would go through SMS/Email gateway.
    console.log(`[SMS/Email Gateway Mock] Sending OTP to ${email}: ${otpSecret}`);

    res.status(201).json({
      message: 'Registration successful. OTP sent.',
      email: newUser.email,
      otpMock: otpSecret, // sent for development/demo ease
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const verifyOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, otp } = parsed.data;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.otpVerified) {
      res.status(400).json({ error: 'User already verified' });
      return;
    }

    // Verify OTP matching and expiry
    if (user.otpSecret !== otp) {
      res.status(400).json({ error: 'Invalid OTP code' });
      return;
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      res.status(400).json({ error: 'OTP has expired' });
      return;
    }

    // Activate User
    user.otpVerified = true;
    user.status = 'ACTIVE';
    user.otpSecret = null;
    user.otpExpiresAt = null;
    await user.save();

    await logAudit({
      userId: user.id,
      action: 'USER_OTP_VERIFIED',
      resource: 'users',
      ipAddress: req.ip,
    });

    res.json({ message: 'OTP verified successfully. Your account is now active.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'PENDING_OTP') {
      res.status(401).json({ error: 'Please verify your mobile number via OTP first' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Your account is suspended. Please contact support.' });
      return;
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const roles = (user as any).Roles?.map((r: any) => r.name) || [];

    await logAudit({
      userId: user.id,
      action: 'USER_LOGGED_IN',
      resource: 'users',
      ipAddress: req.ip,
    });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        roles,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  // Simulate forgot password flow
  res.json({ message: 'If the email exists, a password reset link has been dispatched.' });
};
