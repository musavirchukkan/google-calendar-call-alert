import api from './api';

// Get upcoming events
export const getUpcomingEvents = async () => {
  try {
    return await api.get('/events/upcoming');
  } catch (error) {
    throw error;
  }
};

// Trigger call for specific event
export const triggerEventCall = async (eventId) => {
  try {
    return await api.post(`/events/${eventId}/call`);
  } catch (error) {
    throw error;
  }
};

// Test call functionality
export const testCall = async () => {
  try {
    return await api.post('/events/test-call');
  } catch (error) {
    throw error;
  }
};