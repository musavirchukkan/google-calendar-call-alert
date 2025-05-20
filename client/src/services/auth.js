import api from './api';

// Verify authentication token
export const verifyAuth = async () => {
  try {
    return await api.get('/auth/verify');
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    return await api.get('/auth/me');
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    return await api.get('/auth/logout');
  } catch (error) {
    throw error;
  }
};

// Update phone number
export const updatePhoneNumber = async (phoneNumber) => {
  try {
    return await api.patch('/auth/phone', { phoneNumber });
  } catch (error) {
    throw error;
  }
};

// Revoke calendar access
export const revokeCalendarAccess = async () => {
  try {
    return await api.post('/auth/calendar/revoke');
  } catch (error) {
    throw error;
  }
};

// Disable Twilio notifications
export const disableTwilioNotifications = async () => {
  try {
    return await api.post('/auth/twilio/disable');
  } catch (error) {
    throw error;
  }
};

// Enable Twilio notifications
export const enableTwilioNotifications = async () => {
  try {
    return await api.post('/auth/twilio/enable');
  } catch (error) {
    throw error;
  }
};

// Get Google login URL
export const getGoogleLoginUrl = () => {
  return `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
};