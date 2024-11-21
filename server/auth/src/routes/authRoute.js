import express from 'express';
import { login } from '../controllers/auth/loginController.js';
import { register } from '../controllers/auth/registerController.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
// router.post('/reset-password-request', requestReset);
// router.post('/reset-password', resetPassword);

export default router;