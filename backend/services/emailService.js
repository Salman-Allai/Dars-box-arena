import nodemailer from 'nodemailer';

/**
 * Create transporter (lazy-loaded to ensure env vars are available)
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otp) => {
  const transporter = getTransporter(); // Create transporter here, not at module load
  
  const mailOptions = {
    from: `"Dar's Box Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #333; text-align: center;">Dar's Box Arena</h1>
          <h2 style="color: #FF6B35; text-align: center;">Email Verification</h2>
          <p style="color: #666; font-size: 16px;">Your OTP for email verification is:</p>
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="color: white; font-size: 48px; margin: 0; letter-spacing: 10px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};