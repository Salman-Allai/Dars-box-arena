import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SIOBGwvPhZprD6',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Aaucwqvi4aik35BoxvhYUQ65'
});

// Create Razorpay order and booking
router.post('/create-order', protect, async (req, res) => {
  try {
    const { facility, date, startTime, duration, totalAmount } = req.body;

    console.log('📦 Creating order:', { facility, date, startTime, duration, totalAmount });

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        facility: facility,
        date: date,
        startTime: startTime
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);

    // Calculate end time
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + duration;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;

    // Create booking in database
    const booking = await Booking.create({
      user: req.user._id,
      facility: facility,
      date: new Date(date),
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      totalAmount: totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId: order.id
    });

    console.log('✅ Booking created:', booking._id);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        bookingId: booking._id,
        amount: totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify payment
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    console.log('🔐 Verifying payment:', { bookingId, razorpayOrderId, razorpayPaymentId });

    // Verify signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY')
      .update(sign.toString())
      .digest('hex');

    if (razorpaySignature === expectedSign) {
      console.log('✅ Payment signature verified');

      // Update booking
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: 'confirmed',
          paymentStatus: 'paid',
          razorpayPaymentId: razorpayPaymentId,
          razorpaySignature: razorpaySignature
        },
        { new: true }
      ).populate('facility', 'name type');

      console.log('✅ Booking confirmed:', booking._id);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: booking
      });
    } else {
      console.log('❌ Invalid signature');
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

export default router;