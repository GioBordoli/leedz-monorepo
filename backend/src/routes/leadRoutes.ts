import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import LeadController from '../controllers/LeadController';

const router = express.Router();
const leadController = new LeadController();

// All lead routes require authentication
router.use(authenticateJWT);

// Lead generation endpoints
router.post('/search', leadController.startSearch.bind(leadController));
router.get('/usage', leadController.getUsageStats.bind(leadController));
router.post('/test-api-key', leadController.testApiKey.bind(leadController));

export default router; 