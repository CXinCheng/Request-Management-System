import express from 'express';
import { body } from "express-validator";
import { submitForm, upload } from '../controllers/requestForm/formController.js';
import { 
    getAllRequestsByStudent,  
    getRequestDetails, 
    getAllRequestsByProfessor, 
    updateRequestByStudent, 
    updateRequestStatus,
    deleteRequestByStudent,
    getAllRequestsByModule,
    archiveAllRequests,
    getAllRequestsDetailsByProfessor
} from '../controllers/requestController.js';
import { ensureConnection } from "../configs/db.js";
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const dbConnectionMiddleware = async (req, res, next) => {
    try {
      const connectionActive = await ensureConnection();
      if (!connectionActive) {
        return res.status(503).json({
          success: false,
          error: "Database connection unavailable"
        });
      }
      next();
    } catch (error) {
      console.error("DB middleware error:", error);
      res.status(503).json({
        success: false,
        error: "Database service unavailable"
      });
    }
  };

const requestValidationRules = [
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
];

const router = express.Router();
router.use(dbConnectionMiddleware, verifyToken);

router.post('/submit', authorizeRoles(["Student"]),
    upload.single('uploadFile'), 
    requestValidationRules,
    submitForm);

router.get('/student/:studentId', authorizeRoles(['Student']), getAllRequestsByStudent);
router.put('/student/:requestId', authorizeRoles(['Student']), requestValidationRules, updateRequestByStudent);
router.delete('/student/:requestId', authorizeRoles(['Student']), deleteRequestByStudent);

router.get('/professor/:profId',  authorizeRoles(['Professor']), getAllRequestsByProfessor);
router.put('/professor/:profId/:requestId',authorizeRoles(['Professor']), updateRequestStatus);
router.get('/professor/details/:profId', authorizeRoles(['Professor']), getAllRequestsDetailsByProfessor);

router.get('/module/:moduleCode', authorizeRoles(['Student', 'Professor']), getAllRequestsByModule);
router.get('/details/:requestId', authorizeRoles(['Student', 'Professor']), getRequestDetails);
router.post('/archive', authorizeRoles(['Admin']), archiveAllRequests);

export default router;
