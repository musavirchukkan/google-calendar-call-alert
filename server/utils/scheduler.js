import cron from 'node-cron';
import { getActiveUsers, getUpcomingEvents, formatEventDetails } from '../services/googleService.js';
import { makeCallReminder } from '../services/twilioService.js';

// Set up the scheduler to run every minute
export const initScheduler = () => {
  console.log('Initializing event reminder scheduler...');
  
  // Schedule job to run every minute
  cron.schedule('* * * * *', async () => {
    try {
      await checkUpcomingEvents();
    } catch (error) {
      console.error('Error in scheduler:', error);
    }
  });
  
  console.log('Scheduler initialized successfully');
};

// Check for upcoming events and make calls
const checkUpcomingEvents = async () => {
  console.log('Checking for upcoming events...');
  
  try {
    // Get all active users with calendar and Twilio enabled
    const users = await getActiveUsers();
    
    if (users.length === 0) {
      console.log('No active users found with both Calendar and Twilio enabled');
      return;
    }
    
    console.log(`Found ${users.length} active users`);
    
    // Process each user
    for (const user of users) {
      try {
        // Get upcoming events in next 5 minutes
        const events = await getUpcomingEvents(user);
        
        if (events.length === 0) {
          continue;
        }
        
        console.log(`Found ${events.length} upcoming events for user ${user.email}`);
        
        // Process each event
        for (const event of events) {
          // Check if this is a valid event with necessary data
          if (!event.id || !event.start || !event.start.dateTime) {
            continue;
          }
          
          // Format event details
          const eventMessage = formatEventDetails(event);
          
          // Make call reminder
          console.log(`Making call to ${user.phoneNumber} for event ${event.summary}`);
          const callResult = await makeCallReminder(user.phoneNumber, eventMessage);
          
          if (callResult.success) {
            console.log(`Call successful: ${callResult.callSid}`);
          } else {
            console.error(`Call failed: ${callResult.error}`);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        // Continue with next user even if one fails
      }
    }
    
    console.log('Finished checking for upcoming events');
  } catch (error) {
    console.error('Error checking upcoming events:', error);
    throw error;
  }
};

// For manual testing or triggering
export const manualCheck = async () => {
  try {
    await checkUpcomingEvents();
    return { success: true, message: 'Manual check completed' };
  } catch (error) {
    console.error('Error in manual check:', error);
    return { success: false, error: error.message };
  }
};