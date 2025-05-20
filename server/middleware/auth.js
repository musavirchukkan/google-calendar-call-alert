import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    // Check for JWT in cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user to request
    req.user = { id: user._id, email: user.email };
    
    next();
  } catch (error) {
    // If token is expired or invalid
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Session expired. Please login again.'
    });
  }
};

export const requireCalendarAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isCalendarConnected()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Google Calendar access is required'
      });
    }
    
    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const requireTwilioSetup = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isTwilioConfigured()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Twilio phone number is required'
      });
    }
    
    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error'
    });
  }
};