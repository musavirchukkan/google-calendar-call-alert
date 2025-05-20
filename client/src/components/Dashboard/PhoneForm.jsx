import { useState } from 'react';
import { updatePhoneNumber, disableTwilioNotifications, enableTwilioNotifications } from '../../services/auth';
import { toast } from 'react-toastify';

const PhoneForm = ({ initialPhone, twilioEnabled, onUpdate }) => {
  const [phone, setPhone] = useState(initialPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  // Handle phone number update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await updatePhoneNumber(phone);
      
      if (result.success) {
        toast.success('Phone number updated successfully');
        onUpdate({ 
          phoneNumber: result.data.phoneNumber,
          twilioEnabled: result.data.twilioEnabled,
          isTwilioConfigured: true 
        });
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast.error(`Failed to update phone: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle toggle notifications
  const handleToggleNotifications = async () => {
    setIsChangingStatus(true);
    
    try {
      let result;
      
      if (twilioEnabled) {
        result = await disableTwilioNotifications();
        if (result.success) {
          toast.success('Call notifications disabled');
          onUpdate({ twilioEnabled: false });
        }
      } else {
        result = await enableTwilioNotifications();
        if (result.success) {
          toast.success('Call notifications enabled');
          onUpdate({ twilioEnabled: true });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setIsChangingStatus(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your phone number in international format (e.g., +1234567890)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            {isSubmitting ? 'Saving...' : 'Save Number'}
          </button>
          
          {initialPhone && (
            <button
              type="button"
              onClick={handleToggleNotifications}
              disabled={isChangingStatus}
              className={`px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
                twilioEnabled 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isChangingStatus
                ? 'Updating...' 
                : twilioEnabled 
                  ? 'Disable Notifications' 
                  : 'Enable Notifications'}
            </button>
          )}
        </div>
      </form>
      
      {initialPhone && (
        <div className="mt-3 flex items-center">
          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
            twilioEnabled ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm text-gray-600">
            Call notifications are {twilioEnabled ? 'enabled' : 'disabled'}
          </span>
        </div>
      )}
    </div>
  );
};

export default PhoneForm;