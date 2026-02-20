import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    console.log('📝 Registration request:', req.body);
    
    const { name, email, phone, password } = req.body;
    
    // Validate required fields (name and password are required, email OR phone)
    if (!name || !password) {
      console.log('❌ Missing name or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide name and password'
      });
    }
    
    // At least email OR phone must be provided
    if (!email && !phone) {
      console.log('❌ Missing email and phone');
      return res.status(400).json({
        success: false,
        message: 'Please provide either email or phone'
      });
    }
    
    // Check if user already exists
    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });
    
    const existingUser = await User.findOne({
      $or: query
    });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    
    console.log('✅ Creating new user...');
    
    // Create user (with optional email/phone)
    const user = await User.create({
      name,
      email: email || null,
      phone: phone || null,
      password,
      isEmailVerified: !!email,
      isPhoneVerified: !!phone
    });
    
    console.log('✅ User created:', user._id);
    
    // Generate token
    const token = generateToken(user._id);
    
    console.log('✅ Registration complete!');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    console.log('📝 Login request body:', req.body);
    
    const { email, phone, password } = req.body;
    
    console.log('📧 Email:', email);
    console.log('📱 Phone:', phone);
    console.log('🔐 Password:', password ? 'PROVIDED' : 'MISSING');
    
    // Validate password is provided
    if (!password) {
      console.log('❌ Password is missing');
      return res.status(400).json({
        success: false,
        message: 'Please provide password'
      });
    }
    
    // Validate email or phone is provided
    if (!email && !phone) {
      console.log('❌ Email and phone both missing');
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone'
      });
    }
    
    // Find user by email or phone
    const query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;
    
    console.log('🔍 Searching for user with:', query);
    
    const user = await User.findOne(query).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ User found:', user._id);
    
    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Verify password
    console.log('🔐 Verifying password...');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ Password verified');
    
    // Generate token
    const token = generateToken(user._id);
    
    console.log('✅ Login successful for:', user.email || user.phone);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * Google OAuth Login
 * POST /api/auth/google
 */
export const googleLogin = async (req, res) => {
  try {
    const { email, name, googleId, credential } = req.body;

    console.log('📨 Google login request:', { email, name, googleId, hasCredential: !!credential });

    let userEmail = email;
    let userName = name;
    let userGoogleId = googleId;

    // Handle old credential format (JWT token from Google)
    if (credential && !email) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        userEmail = payload.email;
        userName = payload.name;
        userGoogleId = payload.sub;
        console.log('✅ Verified Google credential');
      } catch (error) {
        console.error('❌ Google credential verification failed:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid Google credential',
        });
      }
    }

    if (!userEmail || !userName || !userGoogleId) {
      console.log('❌ Missing required fields:', { userEmail, userName, userGoogleId });
      return res.status(400).json({
        success: false,
        message: 'Email, name, and Google ID are required',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      // Create new user
      user = await User.create({
        name: userName,
        email: userEmail,
        googleId: userGoogleId,
        isEmailVerified: true,
        phone: null,
      });
      console.log('✅ New user created via Google:', user._id);
    } else {
      // Update existing user
      if (!user.googleId) {
        user.googleId = userGoogleId;
        user.isEmailVerified = true;
        await user.save();
      }
      console.log('✅ Existing user logged in via Google:', user._id);
    }

    const token = generateToken(user._id);

    console.log('✅ Google login successful');

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};