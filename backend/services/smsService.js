import twilio from 'twilio';

/**
 * Get Twilio client (lazy-loaded)
 */
const getTwilioClient = () => {
  // Check if we're in mock mode
  if (process.env.TWILIO_ACCOUNT_SID === 'mock' || !process.env.TWILIO_ACCOUNT_SID) {
    return null;
  }
  
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

/**
 * Send OTP SMS
 */
export const sendOTPSMS = async (phone, otp) => {
  try {
    const client = getTwilioClient();
    
    // Mock mode for development
    if (!client) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📱 SMS OTP for ${phone}: ${otp}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { success: true };
    }
    
    // Real Twilio SMS
    await client.messages.create({
      body: `Your Dar's Box Arena verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('✅ SMS sent successfully to:', phone);
    return { success: true };
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return { success: false, error: error.message };
  }
};