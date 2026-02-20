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