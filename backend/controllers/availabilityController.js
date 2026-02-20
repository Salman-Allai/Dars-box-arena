import Facility from '../models/Facility.js';
import Booking from '../models/Booking.js';
import { generateTimeSlots, formatDate, isPastDate } from '../utils/slotHelpers.js';

/**
 * Clean up expired pending bookings (older than 15 minutes)
 */
const cleanupPendingBookings = async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const result = await Booking.deleteMany({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: fifteenMinutesAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired pending bookings`);
    }
  } catch (error) {
    console.error('Error cleaning up pending bookings:', error);
  }
};

/**
 * Get available slots for a facility on a specific date
 * GET /api/availability/:facilityId?date=YYYY-MM-DD
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { date } = req.query;

    console.log('📅 Getting slots for facility:', facilityId, 'on date:', date);

    // Clean up expired pending bookings first
    await cleanupPendingBookings();

    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const requestedDate = new Date(date);
    
    // Check if date is in the past
    if (isPastDate(requestedDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book slots for past dates'
      });
    }

    // Get facility
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Generate all possible time slots for the facility
    const allSlots = generateTimeSlots(facility, requestedDate);

    // Get existing CONFIRMED bookings only (not pending)
    const existingBookings = await Booking.find({
      facility: facilityId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    console.log(`📊 Found ${existingBookings.length} confirmed bookings`);

    // Mark slots as unavailable if they're booked
    const availableSlots = allSlots.map(slot => {
      const isBooked = existingBookings.some(booking => 
        booking.startTime === slot.startTime
      );

      // Calculate price based on time
      const hour = parseInt(slot.startTime.split(':')[0]);
      let price;
      
      // Day time: 6:00 AM to 4:59 PM (hours 6-16) = hourlyRate
      // Night time: 5:00 PM to 11:59 PM (hours 17-23) = nightRate
      if (hour >= 17) {
        price = facility.nightRate;
        console.log(`🌙 Night slot ${slot.startTime}: ₹${facility.nightRate}`);
      } else {
        price = facility.hourlyRate;
        console.log(`☀️ Day slot ${slot.startTime}: ₹${facility.hourlyRate}`);
      }

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        price: price,
        isAvailable: !isBooked
      };
    });

    console.log(`✅ Returning ${availableSlots.length} slots (${availableSlots.filter(s => s.isAvailable).length} available)`);

    res.status(200).json({
      success: true,
      data: {
        facility: {
          _id: facility._id,
          name: facility.name,
          hourlyRate: facility.hourlyRate,
          nightRate: facility.nightRate
        },
        date: formatDate(requestedDate),
        slots: availableSlots
      }
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};

/**
 * Check if a specific slot is available
 * POST /api/availability/check
 */
export const checkSlotAvailability = async (req, res) => {
  try {
    const { facilityId, date, startTime, duration } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check each hour in the duration
    const startHour = parseInt(startTime.split(':')[0]);
    const requestedDate = new Date(date);
    
    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      const checkTime = `${hour.toString().padStart(2, '0')}:00`;
      
      const existingBooking = await Booking.findOne({
        facility: facilityId,
        date: {
          $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
        },
        startTime: checkTime,
        status: 'confirmed',
        paymentStatus: 'paid'
      });

      if (existingBooking) {
        return res.status(200).json({
          success: true,
          available: false,
          message: `Slot ${checkTime} is already booked`
        });
      }
    }

    // Calculate total price
    let totalPrice = 0;
    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      // Night time starts at 17:00 (5 PM)
      const price = hour >= 17 ? facility.nightRate : facility.hourlyRate;
      totalPrice += price;
    }

    res.status(200).json({
      success: true,
      available: true,
      totalPrice,
      priceBreakdown: {
        hourlyRate: facility.hourlyRate,
        nightRate: facility.nightRate,
        duration: duration
      }
    });

  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
};