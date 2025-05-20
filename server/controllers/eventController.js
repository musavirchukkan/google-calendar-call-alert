import { StatusCodes } from 'http-status-codes';
import { getUpcomingEvents, formatEventDetails } from '../services/googleService.js';
import { makeCallReminder } from '../services/twilioService.js';
import User from '../models/User.js';

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
export const getUpcomingEventsController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if Calendar is connected
    if (!user.isCalendarConnected()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Google Calendar is not connected'
      });
    }
    
    // Get upcoming events
    const events = await getUpcomingEvents(user);
    
    // Format events for response
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      htmlLink: event.htmlLink,
      creator: event.creator
    }));
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch upcoming events'
    });
  }
};

// @desc    Manually trigger call for an event
// @route   POST /api/events/:eventId/call
// @access  Private
export const triggerEventCall = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if Calendar is connected
    if (!user.isCalendarConnected()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Google Calendar is not connected'
      });
    }
    
    // Check if Twilio is configured
    if (!user.isTwilioConfigured()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Phone number is not configured'
      });
    }
    
    // Get all upcoming events
    const events = await getUpcomingEvents(user);
    
    // Find the specific event
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Format event details for the call
    const eventMessage = formatEventDetails(event);
    
    // Make the call
    const callResult = await makeCallReminder(user.phoneNumber, eventMessage);
    
    if (!callResult.success) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to make call',
        error: callResult.error
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Call triggered successfully',
      data: {
        callSid: callResult.callSid,
        status: callResult.status
      }
    });
  } catch (error) {
    console.error('Error triggering event call:', error);
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to trigger event call'
    });
  }
};

// @desc    Test call functionality
// @route   POST /api/events/test-call
// @access  Private
export const testCall = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if Twilio is configured
    if (!user.isTwilioConfigured()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Phone number is not configured'
      });
    }
    
    // Create test message
    const testMessage = 'This is a test call from Calendar Alert System. Your reminder system is working correctly.';
    
    // Make the call
    const callResult = await makeCallReminder(user.phoneNumber, testMessage);
    
    if (!callResult.success) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to make test call',
        error: callResult.error
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Test call triggered successfully',
      data: {
        callSid: callResult.callSid,
        status: callResult.status
      }
    });
  } catch (error) {
    console.error('Error triggering test call:', error);
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to trigger test call'
    });
  }
};