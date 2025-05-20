import express from 'express';
import {
  getUpcomingEventsController,
  triggerEventCall,
  testCall
} from '../controllers/eventController.js';
import { authenticate, requireCalendarAccess, requireTwilioSetup } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get(
  '/upcoming',
  authenticate,
  requireCalendarAccess,
  getUpcomingEventsController
);

router.post(
  '/:eventId/call',
  authenticate,
  requireCalendarAccess,
  requireTwilioSetup,
  triggerEventCall
);

router.post(
  '/test-call',
  authenticate,
  requireTwilioSetup,
  testCall
);

export default router;