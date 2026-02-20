import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required']
  },
  numberOfPeople: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 person required']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'card'],
    default: 'online'
  },
  // Razorpay payment fields
  razorpayOrderId: {
    type: String,
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },
  // Legacy payment ID field
  paymentId: {
    type: String,
    trim: true
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  // QR code for check-in
  qrCode: {
    type: String
  },
  // Additional notes from customer
  notes: {
    type: String,
    trim: true
  },
  // Check-in tracking
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for checking slot availability
bookingSchema.index({ facility: 1, date: 1, startTime: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return bookingDateTime > now && this.status === 'confirmed';
});

// Virtual for checking if booking is past
bookingSchema.virtual('isPast').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.endTime ? this.endTime.split(':') : this.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return bookingDateTime < now;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  // Allow cancellation anytime as long as booking is confirmed
  return this.status === 'confirmed';
};

export default mongoose.model('Booking', bookingSchema);