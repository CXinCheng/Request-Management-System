import express from 'express';
import { getModuleTimetableByClassNo, getAllModules, updateEducator, getUserMappedModules, addUserMappedModule } from '../controllers/moduleController.js';

const router = express.Router();

// Module routes
router.get('/:moduleCode/:classNo', getModuleTimetableByClassNo);
router.get('/all', getAllModules);
router.post('/updateEducator', updateEducator);
router.get("/user-module-mapping/:userId", getUserMappedModules);

router.get("/user-module-mapping/:userId", getUserMappedModules);  // Fetch user-mapped modules
router.post("/user-module-mapping", addUserMappedModule);  // Add user to a module

export default router;