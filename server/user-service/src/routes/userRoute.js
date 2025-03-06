import express from "express";
import {
    deleteUser,
    getAllProfessors,
    getAllUsers,
    updateUser,
    getAllStudents,
    getUser,
} from "../controllers/user/userController.js";
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
router.get("/all", getAllUsers);
router.get("/all/professors", getAllProfessors);
router.get("/all/students", getAllStudents);
router.get("/:matrix_id", getUser);
router.post("/:matrix_id", updateUser);
router.delete("/:matrix_id", deleteUser);

export default router;
