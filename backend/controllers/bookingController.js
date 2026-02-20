import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import { calculateBookingAmount, generateBookingReference, isPastDate } from '../utils/slotHelpers.js';
import QRCode from 'qrcode';

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (req, res) => {
  try {
    const {
      facilityId,
      bookingDate,
      startTime,
      endTime,
      duration,
      numberOfPeople,
      paymentMethod,
      notes
    } = req.body;
    
    const userId = req.user._id; // From auth middleware
    
    // Validate required fields
    if (!facilityId || !bookingDate || !startTime || !endTime || !duration || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: 'All booking fields are required'
      });
    }
    
    // Check if date is in the past
    const bookingDateObj = new Date(bookingDate);
    if (isPastDate(bookingDateObj)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book slots in the past'
      });
    }
    
    // Get facility
    const facility = await Facility.findById(facilityId);
    
    if (!facility || !facility.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found or inactive'
      });
    }
    
    // Check capacity
    if (numberOfPeople > facility.capacity) {
      return res.status(400).json({
        success: false,
        message: `Number of people exceeds facility capacity (${facility.capacity})`
      });
    }
    
    // Check for conflicting bookings
    const startOfDay = new Date(bookingDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDateObj);
    endOfDay.setHours(23, 59, 59, 999);
    
    const conflictingBooking = await Booking.findOne({
      facilityId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      bookingStatus: { $in: ['confirmed', 'completed'] },
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ]
    });
    
    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.'
      });
    }
    
    // Calculate total amount
    const totalAmount = calculateBookingAmount(facility.hourlyRate, duration);
    
    // Generate booking reference for QR code
    const bookingReference = generateBookingReference();
    
    // Generate QR code
    const qrCodeData = JSON.stringify({
      reference: bookingReference,
      facilityId,
      date: bookingDate,
      startTime,
      endTime
    });
    
    const qrCode = await QRCode.toDataURL(qrCodeData);
    
    // Create booking
    const booking = await Booking.create({
      userId,
      facilityId,
      bookingDate: bookingDateObj,
      startTime,
      endTime,
      duration,
      numberOfPeople,
      totalAmount,
      paymentMethod: paymentMethod || 'online',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      bookingStatus: 'confirmed',
      qrCode,
      notes
    });
    
    // Populate user and facility details
    await booking.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'facilityId', select: 'name type hourlyRate' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        bookingReference
      }
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

/**
 * Get user's bookings
 * GET /api/bookings/my-bookings?status=upcoming|past|all
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'all' } = req.query;
    
    let query = { userId };
    
    // Filter by status
    if (status === 'upcoming') {
      query.bookingDate = { $gte: new Date() };
      query.bookingStatus = { $in: ['confirmed'] };
    } else if (status === 'past') {
      query.bookingDate = { $lt: new Date() };
    } else if (status === 'cancelled') {
      query.bookingStatus = 'cancelled';
    }
    
    const bookings = await Booking.find(query)
      .populate('facilityId', 'name type hourlyRate images')
      .sort({ bookingDate: -1, startTime: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
    
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

/**
 * Get single booking details
 * GET /api/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const booking = await Booking.findOne({
      _id: id,
      userId
    }).populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'facilityId', select: 'name type description hourlyRate amenities images' }
    ]);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details',
      error: error.message
    });
  }
};

/**
 * Cancel a booking
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user._id;
    
    const booking = await Booking.findOne({
      _id: id,
      userId
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking can be cancelled
if (!booking.canBeCancelled()) {
  return res.status(400).json({
    success: false,
    message: 'Booking cannot be cancelled. Only confirmed bookings can be cancelled.'
  });
}
    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    
    // If payment was completed, mark for refund
    if (booking.paymentStatus === 'completed') {
      booking.paymentStatus = 'refunded';
    }
    
    await booking.save();
    
    await booking.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'facilityId', select: 'name type' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

/**
 * Update payment status (webhook handler)
 * PATCH /api/bookings/:id/payment
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    booking.paymentStatus = paymentStatus;
    if (paymentId) {
      booking.paymentId = paymentId;
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: booking
    });
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};