import express from 'express';
import { getModuleTimetableByClassNo } from '../controllers/moduleController.js';

const router = express.Router();

// Module routes
router.get('/:moduleCode/:classNo', getModuleTimetableByClassNo);

export default router;