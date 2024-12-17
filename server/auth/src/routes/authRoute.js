import express from 'express';
import { login } from '../controllers/auth/loginController.js';
import { register } from '../controllers/auth/registerController.js';
import { requestReset } from '../controllers/auth/resetPasswordController.js';
import { resetPassword } from '../controllers/auth/resetPasswordController.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/password/request', requestReset);
router.post('/password/reset', resetPassword);

export default router;