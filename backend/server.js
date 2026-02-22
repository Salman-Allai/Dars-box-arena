import dotenv from 'dotenv';
dotenv.config();

// Add debug (remove after testing)
console.log('🔍 EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔍 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET ✅' : 'NOT SET ❌');
console.log('🔍 RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET ✅' : 'NOT SET ❌');
console.log('🔍 RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET ✅' : 'NOT SET ❌');
console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌');

// NOW import everything else
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import razorpayRoutes from './routes/razorpay.js';

const app = express();

// ==================== MIDDLEWARE ====================
// Production-ready CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dars-box-arena.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dar\'s Box Arena Booking API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      facilities: '/api/facilities',
      availability: '/api/availability',
      bookings: '/api/bookings',
      payment: '/api/bookings (create-order, verify-payment)'
    }
  });
});

app.use('/api', apiRoutes);
app.use('/api/bookings', razorpayRoutes);

// ==================== ERROR HANDLING ====================
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    // Connection options for MongoDB Atlas
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/dars-box-arena',
      options
    );
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   Dar's Box Arena Booking System API     ║
    ║   Server running on port ${PORT}           ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
    ║   Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'ENABLED ✅' : 'NOT CONFIGURED ❌'}       ║
    ║   CORS: ${allowedOrigins.length} origins allowed    ║
    ╚═══════════════════════════════════════════╝
    
    📝 Allowed Origins:
    ${allowedOrigins.map(o => `   - ${o}`).join('\n')}
    `);
  });
};

startServer();

export default app;