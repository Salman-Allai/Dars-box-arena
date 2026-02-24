import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { googleLogin } from '../controllers/googleAuthController.js';
import {
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword
} from '../controllers/passwordResetController.js';
import {
  sendEmailOTP,
  verifyEmailOTP,
  sendPhoneOTP,
  verifyPhoneOTP
} from '../controllers/otpController.js';
import {
  getAllFacilities,
  getFacilityById,
  getFacilitiesGrouped
} from '../controllers/facilityController.js';
import {
  getAvailableSlots,
  checkSlotAvailability
} from '../controllers/availabilityController.js';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updatePaymentStatus
} from '../controllers/bookingController.js';

const router = express.Router();

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== AUTH ROUTES ====================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleLogin);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateProfile);

// ==================== PASSWORD RESET ROUTES ====================
router.post('/auth/forgot-password', sendPasswordResetOTP);
router.post('/auth/verify-reset-otp', verifyPasswordResetOTP);
router.post('/auth/reset-password', resetPassword);

// ==================== OTP ROUTES ====================
router.post('/otp/send-email', sendEmailOTP);
router.post('/otp/verify-email', verifyEmailOTP);
router.post('/otp/send-phone', sendPhoneOTP);
router.post('/otp/verify-phone', verifyPhoneOTP);

// ==================== FACILITY ROUTES ====================
router.get('/facilities', getAllFacilities);
router.get('/facilities/grouped', getFacilitiesGrouped);
router.get('/facilities/:id', getFacilityById);

// ==================== AVAILABILITY ROUTES ====================
router.get('/availability/:facilityId', getAvailableSlots);
router.post('/availability/check', checkSlotAvailability);

// ==================== BOOKING ROUTES ====================
router.post('/bookings', protect, createBooking);
router.get('/bookings/my-bookings', protect, getUserBookings);
router.get('/bookings/:id', protect, getBookingById);
router.patch('/bookings/:id/cancel', protect, cancelBooking);
router.patch('/bookings/:id/payment', updatePaymentStatus);

export default router;