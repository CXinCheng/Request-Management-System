import express from "express";
import {
    getClassesByModule,
    getAllModules,
    updateEducator,
    getAllModulesWithNumbersOfEnrolledStudents,
    getAllStudentsByModule,
    updateEnrollmentByModule,
    getModulesByProfessor,
    getModulesByStudent,
} from "../controllers/moduleController.js";

const router = express.Router();

// Module routes
router.get("/all", getAllModules);
router.get("/all/enrolled", getAllModulesWithNumbersOfEnrolledStudents);
router.get("/professor/modules/:professorId", getModulesByProfessor);
router.get("/students/:moduleCode", getAllStudentsByModule);
router.post("/updateEducator", updateEducator);
router.post("/updateEnrollment/:moduleCode", updateEnrollmentByModule);
router.get("/classes/:moduleCode", getClassesByModule);
router.get("/modules/:studentID", getModulesByStudent);

export default router;
router.get('/all', getAllModules);
router.post('/updateEducator', updateEducator);

router.get("/user-module-mapping/:userId", getUserMappedModules);  // Fetch user-mapped modules
router.post("/user-module-mapping", addUserMappedModule);  // Add user to a module
router.get('/:moduleCode/:classNo', getModuleTimetableByClassNo);

export default router;
