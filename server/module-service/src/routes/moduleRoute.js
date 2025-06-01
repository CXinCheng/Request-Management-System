import express from "express";
import {
    getClassesByModule,
    getAllModules,
    updateEducator,
    getAllModulesWithNumbersOfEnrolledStudents,
    getStudentsByModule,
    updateEnrollmentByModule,
    getModulesByProfessor,
    getModulesByStudent,
    getAllFaculties,
    updateSystemSemester,
    bulkEnrollStudentsByModule
} from "../controllers/moduleController.js";
import { ensureConnection } from "../configs/db.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

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

// Module routes
router.get("/all", authorizeRoles(['Admin']), getAllModules);
router.get("/all/faculties", authorizeRoles(['Admin', 'Professor', 'Student']), getAllFaculties);
router.get("/all/enrolled", authorizeRoles(['Admin', 'Professor']), getAllModulesWithNumbersOfEnrolledStudents);
router.get("/professor/modules/:professorId", authorizeRoles(['Admin', 'Professor']), getModulesByProfessor);
router.get("/students/:moduleCode", authorizeRoles(['Admin', 'Professor', 'Student']), getStudentsByModule);
router.post("/updateEducator", authorizeRoles(['Admin']), updateEducator);
router.post("/updateEnrollment/:moduleCode", authorizeRoles(['Admin']), updateEnrollmentByModule);
router.get("/classes/:moduleCode", authorizeRoles(['Admin', 'Professor']), getClassesByModule);
router.get("/students/:studentID/modules", authorizeRoles(['Admin', 'Student']), getModulesByStudent);
router.post("/updateSystemSemester",authorizeRoles(['Admin']), updateSystemSemester);
router.post("/bulkEnroll/:moduleCode", authorizeRoles(['Professor']), bulkEnrollStudentsByModule);

export default router;
