import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUpcomingEvents, triggerEventCall, testCall } from '../../services/events';
import { toast } from 'react-toastify';
import Loader from '../UI/Loader';
import PhoneForm from './PhoneForm';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCallingEvent, setIsCallingEvent] = useState(false);
  const [isTestCalling, setIsTestCalling] = useState(false);

  // Fetch upcoming events
  const fetchEvents = async () => {
    if (!user?.isCalendarConnected) return;
    
    setIsLoading(true);
    try {
      const result = await getUpcomingEvents();
      
      if (result.success) {
        setUpcomingEvents(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(`Failed to fetch events: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on mount and when user changes
  useEffect(() => {
    if (user?.isCalendarConnected) {
      fetchEvents();
    }
  }, [user?.isCalendarConnected]);

  // Handle event call trigger
  const handleTriggerCall = async (eventId) => {
    setIsCallingEvent(true);
    try {
      const result = await triggerEventCall(eventId);
      
      if (result.success) {
        toast.success('Call triggered successfully!');
      }
    } catch (error) {
      console.error('Error triggering call:', error);
      toast.error(`Failed to trigger call: ${error.message}`);
    } finally {
      setIsCallingEvent(false);
    }
  };

  // Handle test call
  const handleTestCall = async () => {
    setIsTestCalling(true);
    try {
      const result = await testCall();
      
      if (result.success) {
        toast.success('Test call triggered successfully!');
      }
    } catch (error) {
      console.error('Error triggering test call:', error);
      toast.error(`Failed to trigger test call: ${error.message}`);
    } finally {
      setIsTestCalling(false);
    }
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Setup section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Setup</h2>
        
        <div className="space-y-6">
          {/* Google Calendar Connection */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-medium text-gray-700">Google Calendar</h3>
              <p className="text-sm text-gray-500">
                Connect to your Google Calendar to receive event reminders
              </p>
            </div>
            
            <div className="flex items-center">
              {user?.isCalendarConnected ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              ) : (
                <a 
                  href="/api/auth/google"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  Connect Calendar
                </a>
              )}
            </div>
          </div>
          
          {/* Phone Number Setup */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Phone Number</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add your phone number to receive call reminders
            </p>
            
            <PhoneForm
              initialPhone={user?.phoneNumber}
              twilioEnabled={user?.twilioEnabled}
              onUpdate={updateUser}
            />
          </div>
          
          {/* Test Call */}
          {user?.isTwilioConfigured && (
            <div className="pt-4">
              <button
                onClick={handleTestCall}
                disabled={isTestCalling}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                {isTestCalling ? 'Making test call...' : 'Test Call'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Send a test call to verify your setup is working correctly.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
          
          <button
            onClick={fetchEvents}
            disabled={isLoading || !user?.isCalendarConnected}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
        
        {!user?.isCalendarConnected ? (
          <div className="text-center py-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto text-gray-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">
              Connect your Google Calendar to view upcoming events
            </p>
            <a 
              href="/api/auth/google"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium mt-4 inline-block"
            >
              Connect Calendar
            </a>
          </div>
        ) : isLoading ? (
          <div className="py-8 text-center">
            <Loader />
            <p className="text-gray-500 mt-4">Loading events...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto text-gray-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-gray-600">No upcoming events in the next 5 minutes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {event.summary || 'Untitled Event'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatEventDate(event.start?.dateTime || event.start?.date)}
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                  
                  {user?.isTwilioConfigured && (
                    <button
                      onClick={() => handleTriggerCall(event.id)}
                      disabled={isCallingEvent}
                      className="px-3 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md"
                    >
                      {isCallingEvent ? 'Calling...' : 'Call Now'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;