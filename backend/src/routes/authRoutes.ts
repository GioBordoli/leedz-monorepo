import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

/**
 * Authentication Routes
 */

// GET /auth/google - Redirect to Google OAuth
router.get('/google', authController.redirectToGoogle);

// GET /auth/callback - Handle OAuth callback
router.get('/callback', authController.handleCallback);

// POST /auth/refresh - Refresh JWT token (requires authentication)
router.post('/refresh', authenticateJWT, authController.refreshToken);

// POST /auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /auth/me - Get current user info (requires authentication)
router.get('/me', authenticateJWT, authController.getCurrentUser);

export default router; 