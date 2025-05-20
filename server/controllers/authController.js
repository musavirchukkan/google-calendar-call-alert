import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { oauth2Client } from '../config/passport.js';
import jwt from 'jsonwebtoken';

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id).select('-tokens.refreshToken');
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ 
      success: false, 
      message: 'User not found' 
    });
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        phoneNumber: user.phoneNumber,
        calendarEnabled: user.calendarEnabled,
        twilioEnabled: user.twilioEnabled,
        isCalendarConnected: user.isCalendarConnected(),
        isTwilioConfigured: user.isTwilioConfigured()
      }
    }
  });
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error during logout'
      });
    }
    
    res.clearCookie('token');
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res) => {
  const token = req.user.generateAuthToken();
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.redirect(`${process.env.CLIENT_URL}/dashboard`);
};

// @desc    Update phone number
// @route   PATCH /api/auth/phone
// @access  Private
export const updatePhoneNumber = async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Phone number is required'
    });
  }
  
  // Phone number validation (basic)
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid phone number format. Please use international format (e.g., +1234567890)'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }
  
  user.phoneNumber = phoneNumber;
  user.twilioEnabled = true;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Phone number updated successfully',
    data: {
      phoneNumber: user.phoneNumber,
      twilioEnabled: user.twilioEnabled
    }
  });
};

// @desc    Verify token and refresh if needed
// @route   GET /api/auth/verify
// @access  Public
export const verifyToken = (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        isAuthenticated: true,
        user: { id: decoded.id, email: decoded.email }
      }
    });
  } catch (error) {
    res.clearCookie('token');
    
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token',
      data: { isAuthenticated: false }
    });
  }
};

// @desc    Revoke calendar access
// @route   POST /api/auth/calendar/revoke
// @access  Private
export const revokeCalendarAccess = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Revoke token at Google
  if (user.tokens.accessToken) {
    try {
      await oauth2Client.revokeToken(user.tokens.accessToken);
    } catch (error) {
      console.error('Error revoking token at Google:', error);
      // Continue even if Google revocation fails
    }
  }
  
  // Update user record
  user.calendarEnabled = false;
  user.tokens.accessToken = '';
  user.tokens.refreshToken = '';
  user.tokens.tokenExpiry = null;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Google Calendar access revoked successfully'
  });
};

// @desc    Disable Twilio notifications
// @route   POST /api/auth/twilio/disable
// @access  Private
export const disableTwilioNotifications = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }
  
  user.twilioEnabled = false;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Twilio notifications disabled successfully'
  });
};

// @desc    Re-enable Twilio notifications
// @route   POST /api/auth/twilio/enable
// @access  Private
export const enableTwilioNotifications = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if phone number exists
  if (!user.phoneNumber) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Phone number is required. Please add a phone number first.'
    });
  }
  
  user.twilioEnabled = true;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Twilio notifications enabled successfully'
  });
};