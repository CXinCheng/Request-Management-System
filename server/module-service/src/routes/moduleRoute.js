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
    getAllFaculties
} from "../controllers/moduleController.js";
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

// Module routes
router.get("/all", getAllModules);
router.get("/all/faculties", getAllFaculties);
router.get("/all/enrolled", getAllModulesWithNumbersOfEnrolledStudents);
router.get("/professor/modules/:professorId", getModulesByProfessor);
router.get("/students/:moduleCode", getStudentsByModule);
router.post("/updateEducator", updateEducator);
router.post("/updateEnrollment/:moduleCode", updateEnrollmentByModule);
router.get("/classes/:moduleCode", getClassesByModule);
router.get("/students/:studentID/modules", getModulesByStudent);

export default router;
