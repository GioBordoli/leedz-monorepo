import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import leadController from '../controllers/LeadController';

const router = express.Router();

// All lead routes require authentication
router.use(authenticateJWT);

// Lead generation endpoints
router.post('/search', leadController.startSearch.bind(leadController));
router.post('/search-stream', leadController.streamSearch.bind(leadController));
router.get('/usage', leadController.getUsageStats.bind(leadController));
router.post('/test-api-key', leadController.testApiKey.bind(leadController));

// Cache management endpoints
router.post('/cleanup-cache', leadController.cleanupCache.bind(leadController));

// Google Sheets integration endpoints
router.post('/export-to-sheets', leadController.exportToSheets.bind(leadController));
router.get('/sheets/auth-status', leadController.checkSheetsAuthStatus.bind(leadController));
router.get('/sheets', leadController.getSheets.bind(leadController));
router.post('/sheets/validate', leadController.validateSpreadsheet.bind(leadController));
router.get('/sheets/:sheetId/worksheets', leadController.getWorksheets.bind(leadController));

export default router; 