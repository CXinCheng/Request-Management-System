import express from 'express';
import { submitForm, upload } from '../controllers/requestForm/formController.js';
import { getAllRequestsByStudent } from '../controllers/requestController.js';
import { body } from "express-validator";

const router = express.Router();

router.get('/student/:studentId', getAllRequestsByStudent);

// router.post('/submit', upload.single("file"),
router.post('/submit',
    [
        body("student").notEmpty().withMessage("Student is required"),
        body("reasonOfLeave").notEmpty().withMessage("Reason of leave is required"),
        body("startDateOfLeave")
            .notEmpty()
            .withMessage("Start Date of leave is required")
            .isISO8601()
            .withMessage("Start Date of leave must be in ISO 8601 format (YYYY-MM-DD)"),
        body("endDateofLeave")
            .notEmpty()
            .withMessage("End Date of leave is required")
            .isISO8601()
            .withMessage("End Date of leave must be in ISO 8601 format (YYYY-MM-DD)"),
        body("modules").notEmpty().withMessage("List of modules is required"),
        body("approvers").notEmpty().withMessage("List of approvers is required"),
    ],
    submitForm);

export default router;
