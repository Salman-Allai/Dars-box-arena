import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Function to get Razorpay instance (lazy initialization)
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create email transporter
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Function to send booking confirmation email to owner
const sendOwnerNotification = async (booking, user, facility) => {
  try {
    const transporter = getEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL || 'salmanallaie@gmail.com',
      subject: `🎉 New Booking - ${facility.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .amount { font-size: 28px; font-weight: bold; color: #f97316; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🏟️ Dar's Box Arena</h1>
              <p style="margin: 10px 0 0 0;">New Booking Received!</p>
            </div>
            <div class="content">
              <h2 style="color: #f97316; margin-top: 0;">New Booking Alert</h2>
              <p>You have received a new booking. Here are the details:</p>
              
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #111827;">Customer Information</h3>
                <div class="detail-row">
                  <span class="label">Name:</span>
                  <span class="value">${user.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Email:</span>
                  <span class="value">${user.email || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Phone:</span>
                  <span class="value">${user.phone || 'N/A'}</span>
                </div>
              </div>

              <div class="booking-details">
                <h3 style="margin-top: 0; color: #111827;">Booking Details</h3>
                <div class="detail-row">
                  <span class="label">Facility:</span>
                  <span class="value">${facility.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span class="value">${new Date(booking.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span class="value">${booking.startTime}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Duration:</span>
                  <span class="value">${booking.duration} hour(s)</span>
                </div>
                <div class="detail-row">
                  <span class="label">Booking ID:</span>
                  <span class="value">${booking._id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment ID:</span>
                  <span class="value">${booking.razorpayPaymentId}</span>
                </div>
              </div>

              <div class="amount">
                💰 ₹${booking.totalAmount}
              </div>

              <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; text-align: center;">
                  ✅ <strong>Payment Status: CONFIRMED</strong>
                </p>
              </div>

              <div class="footer">
                <p>This is an automated notification from Dar's Box Arena Booking System.</p>
                <p style="margin: 5px 0;">📧 ${process.env.EMAIL_USER}</p>
                <p style="margin: 5px 0;">🌐 Dar's Box Arena</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Owner notification email sent to:', process.env.OWNER_EMAIL);
  } catch (error) {
    console.error('❌ Error sending owner notification:', error);
    // Don't throw error - booking should succeed even if email fails
  }
};

/**
 * Create Razorpay Order
 * POST /api/bookings/create-order
 */
router.post('/create-order', protect, async (req, res) => {
  try {
    const { facility, date, startTime, duration, totalAmount } = req.body;

    console.log('📦 Creating order:', { facility, date, startTime, duration, totalAmount });

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);

    // Create booking with pending status
    const booking = await Booking.create({
      user: req.user._id,
      facility,
      date,
      startTime,
      duration,
      totalAmount,
      razorpayOrderId: order.id,
      status: 'pending',
      paymentStatus: 'pending',
    });

    console.log('✅ Booking created:', booking._id);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        bookingId: booking._id,
      },
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
});

/**
 * Verify Payment
 * POST /api/bookings/verify-payment
 */
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    console.log('🔐 Verifying payment:', { bookingId, razorpayOrderId, razorpayPaymentId });

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.log('❌ Payment signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    console.log('✅ Payment signature verified');

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
      { new: true }
    ).populate('user', 'name email phone')
     .populate('facility', 'name type');

    console.log('✅ Booking confirmed:', booking._id);

    // Send email notification to owner
    await sendOwnerNotification(booking, booking.user, booking.facility);

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: booking,
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
});

export default router;