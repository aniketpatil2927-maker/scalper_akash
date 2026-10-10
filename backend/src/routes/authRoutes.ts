import { Router } from 'express';
import { register, verifyOtp, login, forgotPassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);

export default router;
