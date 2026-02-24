import nodemailer from 'nodemailer';

/**
 * Generate 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP Email
 */
export const sendOTPEmail = async (email, otp, purpose = 'Verification') => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Dar's Box Arena - ${purpose} OTP`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #f97316; }
            .otp { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🏟️ Dar's Box Arena</h1>
              <p style="margin: 10px 0 0 0;">${purpose} Code</p>
            </div>
            <div class="content">
              <h2 style="color: #f97316; margin-top: 0;">Your OTP Code</h2>
              <p>Hello,</p>
              <p>You requested a ${purpose.toLowerCase()} code for your Dar's Box Arena account. Please use the following OTP:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Your OTP Code</p>
                <div class="otp">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
              </div>

              <p><strong>Important:</strong></p>
              <ul style="color: #6b7280;">
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>

              <div class="footer">
                <p>This is an automated email from Dar's Box Arena.</p>
                <p style="margin: 5px 0;">📧 ${process.env.EMAIL_USER}</p>
                <p style="margin: 5px 0;">🌐 Dar's Box Arena - Where Champions Train, Play & Conquer</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to: ${email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

/**
 * Send OTP SMS (Mock implementation)
 */
export const sendOTPSMS = async (phone, otp) => {
  try {
    // Mock SMS implementation
    console.log(`📱 SMS OTP would be sent to ${phone}: ${otp}`);
    console.log(`📱 OTP: ${otp}`);
    
    // In production, integrate with SMS service like Twilio:
    /*
    const twilio = require('twilio');
    const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: `Your Dar's Box Arena verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    */
    
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP SMS:', error);
    throw error;
  }
};