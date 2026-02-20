import Booking from '../models/Booking.js';

/**
 * Delete pending bookings older than 15 minutes
 * Run this periodically or before checking availability
 */
export const cleanupPendingBookings = async () => {
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