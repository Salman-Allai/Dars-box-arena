import crypto from 'crypto';

// Store OTPs in memory (in production, use Redis)
const otpStore = new Map();

/**
 * Generate 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP with expiry (5 minutes)
 */
export const storeOTP = (identifier, otp, type = 'email') => {
  const key = `${type}:${identifier}`;
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  otpStore.set(key, {
    otp,
    expiresAt,
    attempts: 0
  });
  
  // Auto-delete after expiry
  setTimeout(() => {
    otpStore.delete(key);
  }, 5 * 60 * 1000);
};

/**
 * Verify OTP
 */
export const verifyOTP = (identifier, otp, type = 'email') => {
  const key = `${type}:${identifier}`;
  const stored = otpStore.get(key);
  
  if (!stored) {
    return { success: false, message: 'OTP expired or not found' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { success: false, message: 'OTP expired' };
  }
  
  if (stored.attempts >= 3) {
    otpStore.delete(key);
    return { success: false, message: 'Too many failed attempts' };
  }
  
  if (stored.otp !== otp) {
    stored.attempts++;
    return { success: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(key);
  return { success: true, message: 'OTP verified successfully' };
};