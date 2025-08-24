import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { 
  validateProfileUpdate, 
  validateApiKey, 
  validateAccountDeletion,
  validateRateLimit,
  sanitizeInput 
} from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Apply authentication to all user routes
router.use(authenticateJWT);

// Apply input sanitization to all routes
router.use(sanitizeInput);

/**
 * User Profile Management Routes
 */

// Get user profile
// GET /api/user/profile
router.get('/profile', userController.getProfile.bind(userController));

// Update user profile
// PUT /api/user/profile
router.put('/profile', 
  validateRateLimit(60000, 10), // 10 requests per minute for profile updates
  validateProfileUpdate,
  userController.updateProfile.bind(userController)
);

/**
 * API Key Management Routes
 */

// Store/Update Google Places API key
// POST /api/user/api-key
router.post('/api-key',
  validateRateLimit(300000, 5), // 5 requests per 5 minutes for API key updates
  validateApiKey,
  userController.setApiKey.bind(userController)
);

// Get API key status (without exposing actual key)
// GET /api/user/api-key/status
router.get('/api-key/status', userController.getApiKeyStatus.bind(userController));

/**
 * Usage Statistics Routes
 */

// Get daily usage statistics
// GET /api/user/usage
router.get('/usage', userController.getUsageStats.bind(userController));

/**
 * Account Management Routes
 */

// Delete user account (GDPR compliance)
// DELETE /api/user/account
router.delete('/account',
  validateRateLimit(86400000, 3), // 3 requests per day for account deletion attempts
  validateAccountDeletion,
  userController.deleteAccount.bind(userController)
);

// POST /api/user/complete-onboarding - Mark onboarding as completed
router.post('/complete-onboarding', authenticateJWT, userController.completeOnboarding.bind(userController));

// TODO: Add routes for sheet configuration management
// TODO: Add billing/subscription management routes
// FIXME: Implement comprehensive rate limiting with Redis for production

export default router; 