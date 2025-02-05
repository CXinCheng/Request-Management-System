import express from 'express';
import { deleteUser, getAllProfessors, getAllUsers, updateUser } from '../controllers/user/userController.js';

const router = express.Router();

router.get('/all', getAllUsers);
router.post('/:matrix_id', updateUser);
router.delete('/:matrix_id', deleteUser);
router.get('/all/professors', getAllProfessors);

export default router;