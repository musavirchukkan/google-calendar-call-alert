import express from 'express';
import passport from 'passport';
import {
  getCurrentUser,
  logout,
  googleCallback,
  updatePhoneNumber,
  verifyToken,
  revokeCalendarAccess,
  disableTwilioNotifications,
  enableTwilioNotifications
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly'
    ],
    prompt: 'consent',
    accessType: 'offline'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`
  }),
  googleCallback
);

// Auth verification route
router.get('/verify', verifyToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.get('/logout', authenticate, logout);
router.patch('/phone', authenticate, updatePhoneNumber);

// Calendar access management
router.post('/calendar/revoke', authenticate, revokeCalendarAccess);

// Twilio notifications management
router.post('/twilio/disable', authenticate, disableTwilioNotifications);
router.post('/twilio/enable', authenticate, enableTwilioNotifications);

export default router;