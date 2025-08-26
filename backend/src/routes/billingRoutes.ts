import express from 'express';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';
import BillingController from '../controllers/BillingController';

const router = express.Router();
const billingController = new BillingController();

// Apply auth middleware to all billing routes except public endpoints
router.use((req, res, next) => {
  // Skip auth for public endpoints
  if (req.path === '/plans') {
    return next();
  }
  return authenticateJWT(req, res, next);
});

// GET /api/billing/status
// Enhanced billing status with comprehensive tier information (protected)
router.get('/status', billingController.getBillingStatus.bind(billingController));

// GET /api/billing/plans  
// Plan comparison and pricing information (public endpoint with optional auth)
router.get('/plans', optionalAuth, billingController.getPlans.bind(billingController));

export default router; 