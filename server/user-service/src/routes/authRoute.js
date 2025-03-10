import express from 'express';
import { login } from '../controllers/auth/loginController.js';
import { register } from '../controllers/auth/registerController.js';
import { verifyEmail, verifyOTP, resetPassword } from '../controllers/auth/resetPasswordController.js';
import { ensureConnection } from "../configs/db.js";

const dbConnectionMiddleware = async (req, res, next) => {
    try {
      const connectionActive = await ensureConnection();
      if (!connectionActive) {
        return res.status(503).json({
          success: false,
          error: "Database connection unavailable"
        });
      }
      next();
    } catch (error) {
      console.error("DB middleware error:", error);
      res.status(503).json({
        success: false,
        error: "Database service unavailable"
      });
    }
  };

const router = express.Router();
router.use(dbConnectionMiddleware);

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/password/verifyEmail', verifyEmail);
router.post('/password/verifyOTP', verifyOTP);
router.post('/password/reset', resetPassword);

export default router;