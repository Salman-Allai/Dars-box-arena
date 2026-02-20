import { generateOTP, storeOTP, verifyOTP } from '../utils/otpHelper.js';
import { sendOTPEmail } from '../services/emailService.js';
import { sendOTPSMS } from '../services/smsService.js';
import User from '../models/User.js';
import OTP from '../models/OTP.js';

/**
 * Send Email OTP
 * POST /api/otp/send-email
 */
export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp, 'email');

    // Send email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to email successfully'
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

/**
 * Verify Email OTP
 * POST /api/otp/verify-email
 */
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const result = verifyOTP(email, otp, 'email');

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

/**
 * Send Phone OTP
 * POST /api/otp/send-phone
 */
export const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Mock mode - log OTP instead of sending
    if (process.env.SMS_MODE === 'mock') {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📱 SMS OTP for ${phone}: ${otp}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }

    // Store OTP in database
    await OTP.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    return res.json({ 
      success: true, 
      message: 'OTP sent successfully (check server logs)' 
    });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/**
 * Verify Phone OTP
 * POST /api/otp/verify-phone
 */
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and OTP are required' 
      });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Mark phone as verified
    await User.findOneAndUpdate(
      { phone },
      { phoneVerified: true }
    );

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.json({ 
      success: true, 
      message: 'Phone verified successfully' 
    });
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};