import express from 'express';
import { getModuleTimetableByClassNo, getAllModules, updateEducator, getUserMappedModules, addUserMappedModule } from '../controllers/moduleController.js';

const router = express.Router();

// Module routes
router.get('/all', getAllModules);
router.post('/updateEducator', updateEducator);

router.get("/user-module-mapping/:userId", getUserMappedModules);  // Fetch user-mapped modules
router.post("/user-module-mapping", addUserMappedModule);  // Add user to a module
router.get('/:moduleCode/:classNo', getModuleTimetableByClassNo);

export default router;