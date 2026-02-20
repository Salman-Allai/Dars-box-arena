import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  phone: {
    type: String,
    trim: true,
    default: null  // ✅ Use null instead of undefined or empty string
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    sparse: true  // ✅ For Google OAuth users
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes - email is always unique, phone is unique only when not null
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index(
  { phone: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { 
      phone: { $type: 'string', $ne: null, $ne: '' } 
    }
  }
);
userSchema.index({ googleId: 1 }, { sparse: true });

// Hash password before saving (only if password exists)
userSchema.pre('save', async function(next) {
  // Skip if no password (Google OAuth users)
  if (!this.password) {
    return next();
  }
  
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;