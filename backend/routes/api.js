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

// ==================== AUTH ROUTES ====================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleLogin);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateProfile);

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