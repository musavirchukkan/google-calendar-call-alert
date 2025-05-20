import { google } from 'googleapis';
import User from '../models/User.js';

// Create calendar client
export const createCalendarClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.tokens.accessToken,
    refresh_token: user.tokens.refreshToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Refresh access token if expired
export const refreshTokenIfNeeded = async (user) => {
  try {
    // Check if token is expired or will expire in the next 5 minutes
    const tokenExpiryTime = new Date(user.tokens.tokenExpiry).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;

    if (tokenExpiryTime - currentTime <= fiveMinutesInMs) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
      );

      oauth2Client.setCredentials({
        refresh_token: user.tokens.refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update user's tokens
      user.tokens.accessToken = credentials.access_token;
      
      // Only update refresh token if a new one was provided
      if (credentials.refresh_token) {
        user.tokens.refreshToken = credentials.refresh_token;
      }
      
      // Set expiration time
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + credentials.expires_in);
      user.tokens.tokenExpiry = expiryDate;

      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    // If refresh fails, mark calendar as disabled
    user.calendarEnabled = false;
    await user.save();
    
    throw new Error('Failed to refresh Google token');
  }
};

// Get upcoming events in the next 5 minutes
export const getUpcomingEvents = async (user) => {
  try {
    // Refresh token if needed
    const refreshedUser = await refreshTokenIfNeeded(user);
    
    // Create calendar client
    const calendar = createCalendarClient(refreshedUser);
    
    // Calculate time range (now to 5 minutes from now)
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    // List events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: fiveMinutesFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
};

// Get all active users with both calendar and Twilio enabled
export const getActiveUsers = async () => {
  return User.find({
    isActive: true,
    calendarEnabled: true,
    twilioEnabled: true,
    phoneNumber: { $exists: true, $ne: '' },
    'tokens.accessToken': { $exists: true, $ne: '' },
    'tokens.refreshToken': { $exists: true, $ne: '' }
  });
};

// Format event details for phone call
export const formatEventDetails = (event) => {
  let message = 'You have an upcoming event';
  
  if (event.summary) {
    message += ` titled ${event.summary}`;
  }
  
  if (event.start && event.start.dateTime) {
    const startTime = new Date(event.start.dateTime);
    message += ` starting at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  if (event.location) {
    message += ` at ${event.location}`;
  }
  
  return message;
};