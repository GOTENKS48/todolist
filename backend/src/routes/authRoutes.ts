import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoints
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
