import express from 'express';
import { getModuleTimetableByClassNo, getAllModules, updateEducator } from '../controllers/moduleController.js';

const router = express.Router();

// Module routes
router.get('/:moduleCode/:classNo', getModuleTimetableByClassNo);
router.get('/all', getAllModules);
router.post('/updateEducator', updateEducator);

export default router;