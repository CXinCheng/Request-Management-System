import express from "express";
import {
    getClassesByModule,
    getAllModules,
    updateEducator,
    getAllModulesWithNumbersOfEnrolledStudents,
    getAllStudentsByModule,
    updateEnrollmentByModule,
} from "../controllers/moduleController.js";

const router = express.Router();

// Module routes
router.get("/all", getAllModules);
router.get("/all/enrolled", getAllModulesWithNumbersOfEnrolledStudents);
router.get("/students/:moduleCode", getAllStudentsByModule);
router.post("/updateEducator", updateEducator);
router.post("/updateEnrollment/:moduleCode", updateEnrollmentByModule);
router.get("/classes/:moduleCode", getClassesByModule);

export default router;
