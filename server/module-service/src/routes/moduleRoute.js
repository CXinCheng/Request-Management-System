import express from 'express';
import { getModuleTimetableByClassNo, getAllModules } from '../controllers/moduleController.js';

const router = express.Router();

// Module routes
router.get('/:moduleCode/:classNo', getModuleTimetableByClassNo);
router.get('/all', getAllModules);

export default router;