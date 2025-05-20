import twilio from 'twilio';

// Create Twilio client
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  return twilio(accountSid, authToken);
};

// Make phone call with event reminder
export const makeCallReminder = async (phoneNumber, eventMessage) => {
  try {
    const client = createTwilioClient();
    
    // Create TwiML for the call
    const twiml = `
      <Response>
        <Say voice="alice" language="en-US">
          Hello! This is your calendar reminder. ${eventMessage}
        </Say>
        <Pause length="1"/>
        <Say voice="alice" language="en-US">
          Thank you for using our reminder service. Goodbye!
        </Say>
      </Response>
    `;
    
    // Encode TwiML for URL
    const encodedTwiml = encodeURIComponent(twiml);
    
    // Make the call
    const call = await client.calls.create({
      twiml: twiml,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    return {
      success: true,
      callSid: call.sid,
      status: call.status
    };
  } catch (error) {
    console.error('Error making Twilio call:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify if Twilio credentials are valid
export const verifyTwilioCredentials = async () => {
  try {
    const client = createTwilioClient();
    
    // Try to fetch account info to verify credentials
    await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    return true;
  } catch (error) {
    console.error('Error verifying Twilio credentials:', error);
    return false;
  }
};

// Check if the phone number is valid
export const validatePhoneNumber = async (phoneNumber) => {
  try {
    const client = createTwilioClient();
    
    const lookup = await client.lookups.v2.phoneNumbers(phoneNumber).fetch();
    
    return {
      valid: lookup.valid,
      formattedNumber: lookup.phoneNumber,
      countryCode: lookup.countryCode
    };
  } catch (error) {
    console.error('Error validating phone number:', error);
    
    return {
      valid: false,
      error: error.message
    };
  }
};