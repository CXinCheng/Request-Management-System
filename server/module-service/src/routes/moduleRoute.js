import express from 'express';
import { getModuleTimetable } from '../controllers/moduleController.js';

const router = express.Router();

// Module routes
router.get('/:moduleCode', getModuleTimetable);

export default router;