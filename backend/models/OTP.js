import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
  },
  contactType: {
    type: String,
    enum: ['email', 'phone'],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups and auto-deletion
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ contact: 1, contactType: 1 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;