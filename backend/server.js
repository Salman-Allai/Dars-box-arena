import dotenv from 'dotenv';
dotenv.config();

// Add debug (remove after testing)
console.log('🔍 EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔍 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET ✅' : 'NOT SET ❌');
console.log('🔍 RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET ✅' : 'NOT SET ❌');
console.log('🔍 RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET ✅' : 'NOT SET ❌');

// NOW import everything else
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import razorpayRoutes from './routes/razorpay.js';

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

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
    endpoints: {
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
    message: 'Route not found'
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
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dars-box-arena', {
      // useNewUrlParser: true,     // REMOVE THIS
      // useUnifiedTopology: true   // REMOVE THIS
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   Dar's Box Arena Booking System API     ║
    ║   Server running on port ${PORT}           ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
    ║   Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'ENABLED ✅' : 'NOT CONFIGURED ❌'}       ║
    ╚═══════════════════════════════════════════╝
    `);
  });
};

startServer();

export default app;