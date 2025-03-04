import express from "express";
import {
    getClassesByModule,
    getAllModules,
    updateEducator,
    getAllModulesWithNumbersOfEnrolledStudents,
    getStudentsByModule,
    updateEnrollmentByModule,
    getModulesByProfessor,
    getAllFaculties
} from "../controllers/moduleController.js";

const router = express.Router();

// Module routes
router.get("/all", getAllModules);
router.get("/all/faculties", getAllFaculties);
router.get("/all/enrolled", getAllModulesWithNumbersOfEnrolledStudents);
router.get("/professor/modules/:professorId", getModulesByProfessor);
router.get("/students/:moduleCode", getStudentsByModule);
router.post("/updateEducator", updateEducator);
router.post("/updateEnrollment/:moduleCode", updateEnrollmentByModule);
router.get("/classes/:moduleCode", getClassesByModule);

export default router;
