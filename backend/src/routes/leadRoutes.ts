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

// Google Sheets integration endpoints
router.post('/export-to-sheets', leadController.exportToSheets.bind(leadController));
router.get('/sheets/auth-status', leadController.checkSheetsAuthStatus.bind(leadController));
router.get('/sheets', leadController.getSheets.bind(leadController));
router.post('/sheets/validate', leadController.validateSpreadsheet.bind(leadController));
router.get('/sheets/:sheetId/worksheets', leadController.getWorksheets.bind(leadController));

export default router; 