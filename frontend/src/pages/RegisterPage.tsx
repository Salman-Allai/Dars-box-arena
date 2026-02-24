import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config/api';
import toast from 'react-hot-toast';

type Step = 'details' | 'verify-otp' | 'success';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');

  // Detect if input is email or phone
  const detectContactType = (value: string): 'email' | 'phone' => {
    if (value.includes('@')) {
      return 'email';
    }
    if (/^[+]?[\d\s-]+$/.test(value)) {
      return 'phone';
    }
    return 'email';
  };

  const handleContactChange = (value: string) => {
    setFormData({ ...formData, contact: value });
    setContactType(detectContactType(value));
  };

  // Step 1: Submit Details and Send OTP
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const type = detectContactType(formData.contact);
    
    setLoading(true);
    try {
      const endpoint = type === 'email' ? '/api/otp/send-email' : '/api/otp/send-phone';
      const body = type === 'email' 
        ? { email: formData.contact } 
        : { phone: formData.contact };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`OTP sent to your ${type}!`);
        setContactType(type);
        setStep('verify-otp');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Complete Registration
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const endpoint = contactType === 'email' ? '/api/otp/verify-email' : '/api/otp/verify-phone';
      const body = contactType === 'email'
        ? { email: formData.contact, otp }
        : { phone: formData.contact, otp };

      const verifyResponse = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        toast.error(verifyData.message || 'Invalid OTP');
        setLoading(false);
        return;
      }

      toast.success('OTP verified! Creating account...');

      // Step 2: Register user
      const registrationBody = contactType === 'email'
        ? {
            name: formData.name,
            email: formData.contact,
            phone: '',
            password: formData.password,
          }
        : {
            name: formData.name,
            email: '',
            phone: formData.contact,
            password: formData.password,
          };

      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationBody),
      });

      const registerData = await registerResponse.json();

      console.log('✅ Registration response:', registerData);

      if (registerData.success) {
        // ✅ CRITICAL FIX: Properly extract token and user from nested data object
        const { token, user } = registerData.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update Zustand store
        useAuthStore.setState({
          token: token,
          user: user,
          isAuthenticated: true,
        });

        toast.success(`Welcome ${user.name}! Account created successfully!`);
        setStep('success');
        
        // Redirect to facilities after 1.5 seconds
        setTimeout(() => {
          navigate('/facilities');
        }, 1500);
      } else {
        toast.error(registerData.message || 'Failed to create account');
        console.error('❌ Registration error:', registerData);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setLoading(true);
    try {
      const endpoint = contactType === 'email' ? '/api/otp/send-email' : '/api/otp/send-phone';
      const body = contactType === 'email'
        ? { email: formData.contact }
        : { phone: formData.contact };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`OTP resent to your ${contactType}!`);
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch {
      toast.error('Error resending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-2xl">
          
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            <div className={`flex flex-col items-center ${step === 'details' ? 'text-orange-500' : 'text-green-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step === 'details' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                {step === 'details' ? '1' : '✓'}
              </div>
              <span className="text-xs">Details</span>
            </div>
            
            <div className={`flex-1 h-1 mt-5 mx-2 ${step === 'verify-otp' || step === 'success' ? 'bg-green-500' : 'bg-gray-700'}`}></div>
            
            <div className={`flex flex-col items-center ${step === 'verify-otp' ? 'text-orange-500' : step === 'success' ? 'text-green-500' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step === 'success' ? 'bg-green-500 text-white' : step === 'verify-otp' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                {step === 'success' ? '✓' : '2'}
              </div>
              <span className="text-xs">Verify</span>
            </div>
          </div>

          {/* Step 1: Enter Details */}
          {step === 'details' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black mb-2 text-white">Create Account</h1>
                <p className="text-gray-400">Enter your details to register</p>
              </div>

              <form onSubmit={handleSubmitDetails} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Email or Phone Number
                    <span className="text-xs text-gray-500 ml-2">
                      ({contactType === 'email' ? '📧 Email detected' : '📱 Phone detected'})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => handleContactChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="john@example.com or +91 98765 43210"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    OTP will be sent to {contactType === 'email' ? 'email' : 'phone'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Continue'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify-otp' && (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{contactType === 'email' ? '📧' : '📱'}</div>
                <h1 className="text-3xl font-black mb-2 text-white">Verify {contactType === 'email' ? 'Email' : 'Phone'}</h1>
                <p className="text-gray-400">Enter the OTP sent to</p>
                <p className="text-orange-500 font-semibold">{formData.contact}</p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={loading}
                  className="w-full text-orange-500 hover:text-orange-400 text-sm font-semibold"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-gray-500 hover:text-gray-400 text-sm"
                >
                  ← Change {contactType === 'email' ? 'Email' : 'Phone'}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-black mb-2 text-white">Success!</h1>
              <p className="text-gray-400 mb-4">Your account has been created</p>
              <div className="animate-pulse text-orange-500">Redirecting to facilities...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;