import express from 'express';
import { body } from "express-validator";
import { submitForm, upload } from '../controllers/requestForm/formController.js';
import { 
    getAllRequestsByStudent, 
    getRequestDetails, 
    getAllRequestsByProfessor, 
    updateRequestByStudent, 
    updateRequestByProfessor,
    deleteRequestByStudent
} from '../controllers/requestController.js';

const router = express.Router();

router.get('/student/:studentId', getAllRequestsByStudent);
router.get('/details/:requestId', getRequestDetails);
router.put('/student/:requestId', updateRequestByStudent);
router.delete('/student/:requestId', deleteRequestByStudent);

router.get('/professor/:profId', getAllRequestsByProfessor);
router.put('/professor/:profId/:requestId', updateRequestByProfessor);

router.post('/submit',
    upload.single('uploadFile'), 
    [
        body("student").notEmpty().withMessage("Student is required"),
        body("reasonOfLeave").notEmpty().withMessage("Reason of leave is required"),
        body("startDateOfLeave")
            .notEmpty()
            .withMessage("Start Date of leave is required")
            .isISO8601()
            .withMessage("Start Date of leave must be in ISO 8601 format (YYYY-MM-DD)"),
        body("endDateOfLeave")
            .notEmpty()
            .withMessage("End Date of leave is required")
            .isISO8601()
            .withMessage("End Date of leave must be in ISO 8601 format (YYYY-MM-DD)"),
        body("modules").notEmpty().withMessage("List of modules is required"),
        body("approvers").notEmpty().withMessage("List of approvers is required"),
    ],
    submitForm);

export default router;
