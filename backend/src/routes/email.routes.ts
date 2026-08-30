import { Router } from 'express';
import { emailController } from '../controllers/email.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Handle OPTIONS preflight requests for all email routes
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.sendStatus(200);
});

// All email routes require authentication
router.use(requireAuth);

// Schedule emails
router.post('/schedule', emailController.scheduleEmail);

// Get scheduled emails
router.get('/scheduled', emailController.getScheduledEmails);

// Get sent emails
router.get('/sent', emailController.getSentEmails);

// Cancel a scheduled email
router.delete('/:emailId/cancel', emailController.cancelEmail);

export default router;