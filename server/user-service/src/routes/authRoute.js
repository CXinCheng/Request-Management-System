import express from 'express';
import { login } from '../controllers/auth/loginController.js';
import { register } from '../controllers/auth/registerController.js';
import { verifyEmail, verifyOTP, resetPassword } from '../controllers/auth/resetPasswordController.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/password/verifyEmail', verifyEmail);
router.post('/password/verifyOTP', verifyOTP);
router.post('/password/reset', resetPassword);

export default router;