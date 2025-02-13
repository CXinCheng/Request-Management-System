import express from "express";
import {
    deleteUser,
    getAllProfessors,
    getAllUsers,
    updateUser,
    getAllStudents,
} from "../controllers/user/userController.js";

const router = express.Router();

router.get("/all", getAllUsers);
router.get("/all/professors", getAllProfessors);
router.get("/all/students", getAllStudents);
router.post("/:matrix_id", updateUser);
router.delete("/:matrix_id", deleteUser);

export default router;
