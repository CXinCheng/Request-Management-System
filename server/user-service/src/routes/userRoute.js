import express from "express";
import {
    deleteUser,
    getAllProfessors,
    getAllUsers,
    updateUser,
    getAllStudents,
    getUser,
    getProfessors,
    setEmailInterval
} from "../controllers/user/userController.js";
import { ensureConnection } from "../configs/db.js";
import { verifyToken, authorizeRoles, checkResourceOwnership } from "../middlewares/authMiddleware.js";

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
router.use(dbConnectionMiddleware, verifyToken);
router.get("/all", authorizeRoles(['Admin']) ,getAllUsers);
router.get("/all/professors", authorizeRoles(['Admin']), getAllProfessors);
router.get("/all/students", authorizeRoles(['Admin', 'Professor']), getAllStudents);
router.put('/professors/:profId/email-interval', authorizeRoles(['Professor']), setEmailInterval)
router.get("/professors", authorizeRoles(['Admin', 'Student']), getProfessors);
router.get("/:matrix_id", authorizeRoles(['Admin', 'Student', 'Professor']), checkResourceOwnership, getUser);
router.post("/:matrix_id", authorizeRoles(['Admin', 'Student', 'Professor']), checkResourceOwnership, updateUser);
router.delete("/:matrix_id", authorizeRoles(['Admin']), deleteUser);

export default router;
