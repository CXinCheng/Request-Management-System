import express from 'express';
import { deleteUser, getAllUsers, updateUser } from '../controllers/user/userController.js';

const router = express.Router();

router.get('/all', getAllUsers);
router.post('/:matrix_id', updateUser);
router.delete('/:matrix_id', deleteUser);

export default router;