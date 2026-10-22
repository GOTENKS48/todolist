import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTaskStats,
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protect all task endpoints with JWT authentication
router.use(authenticateToken);

// Dashboard metrics
router.get('/stats', getTaskStats);

// Tasks CRUD
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Fast toggle completion status
router.patch('/:id/toggle', toggleTaskCompletion);

export default router;
