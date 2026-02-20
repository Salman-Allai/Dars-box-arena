import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Facility, TimeSlot } from '../types';
import { formatCurrency, formatTime } from '../lib/utils';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  method?: {
    netbanking?: boolean;
    card?: boolean;
    wallet?: boolean;
    upi?: boolean;
    paylater?: boolean;
  };
  config?: {
    display?: {
      blocks?: {
        [key: string]: {
          name: string;
          instruments: Array<{
            method: string;
            wallets?: string[];
          }>;
        };
      };
      hide?: Array<{ method: string }>;
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const BookingPage = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(1); // hours (max 3)
  const [loading, setLoading] = useState(false);

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadFacility = useCallback(async () => {
    try {
      const response = await api.get(`/api/facilities/${facilityId}`);
      if (response.data.success) {
        setFacility(response.data.data);
      }
    } catch {
      toast.error('Error loading facility');
    }
  }, [facilityId]);

  const loadAvailability = useCallback(async () => {
    if (!facility) return;
    try {
      const dateStr = formatDateForAPI(selectedDate);
      const response = await api.get(`/api/availability/${facilityId}?date=${dateStr}`);
      
      console.log('📊 Slots response:', response.data);
      
      if (response.data.success && response.data.data?.slots) {
        setAvailableSlots(response.data.data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  }, [facilityId, selectedDate, facility]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }
    loadFacility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, isAuthenticated, navigate]);

  useEffect(() => {
    if (facility) {
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, facility]);

  // Calculate total price based on duration and time
  const calculateTotalPrice = () => {
    if (!selectedSlot || !facility) return 0;

    const startHour = parseInt(selectedSlot.startTime.split(':')[0]);
    let total = 0;

    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      // Night rate starts at 5 PM (17:00)
      const price = hour >= 17 ? facility.nightRate : facility.hourlyRate;
      total += price;
    }

    return total;
  };

  // Check if slot range is available for selected duration
  const isSlotRangeAvailable = (slot: TimeSlot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    
    for (let i = 0; i < duration; i++) {
      const checkHour = startHour + i;
      const checkTime = `${checkHour.toString().padStart(2, '0')}:00`;
      const checkSlot = availableSlots.find(s => s.startTime === checkTime);
      
      if (!checkSlot || !checkSlot.isAvailable) {
        return false;
      }
    }
    
    return true;
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    const totalAmount = calculateTotalPrice();

    setLoading(true);
    try {
      // Step 1: Create booking and get Razorpay order
      const token = localStorage.getItem('token');
      const response = await api.post('/api/bookings/create-order', {
        facility: facilityId!,
        date: formatDateForAPI(selectedDate),
        startTime: selectedSlot.startTime,
        duration: duration,
        totalAmount: totalAmount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        toast.error(response.data.message || 'Failed to create order');
        setLoading(false);
        return;
      }

      const { orderId, bookingId } = response.data.data;

      // Step 2: Initialize Razorpay with all payment methods
      const options: RazorpayOptions = {
        key: 'rzp_test_SIOBGwvPhZprD6',
        amount: totalAmount * 100,
        currency: 'INR',
        name: "Dar's Box Arena",
        description: `${facility?.name} Booking`,
        order_id: orderId,
        handler: async function (razorpayResponse: RazorpayResponse) {
          // Step 3: Verify payment
          try {
            const verifyResponse = await api.post('/api/bookings/verify-payment', {
              bookingId: bookingId,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Booking confirmed!');
              navigate('/my-bookings');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          facility: facility?.name || '',
          date: formatDateForAPI(selectedDate),
          time: selectedSlot.startTime,
          duration: `${duration} hour(s)`
        },
        theme: {
          color: '#F97316',
          backdrop_color: '#000000'
        },
        method: {
          netbanking: true,
          card: true,
          wallet: true,
          upi: true,
          paylater: false
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "All payment methods",
                instruments: [
                  { method: 'upi' },
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ]
              }
            },
            hide: [
              { method: 'emi' },
              { method: 'paylater' }
            ],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            setLoading(false);
          },
          escape: true,
          backdropclose: false
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Booking error:', error);
      toast.error(err.response?.data?.message || 'Booking failed');
      setLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    
    // Don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) return;
    
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const isDateSelected = (day: number) => {
    return selectedDate.getDate() === day;
  };

  const isDatePast = (day: number) => {
    const checkDate = new Date(selectedDate);
    checkDate.setDate(day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  if (!facility) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Shortened for mobile

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/facilities')}
            className="text-gray-400 hover:text-white mb-3 sm:mb-4 inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <span>←</span> Back to Facilities
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 px-4">
            Book <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{facility.name}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 px-4">{facility.description}</p>
          
          {/* Pricing Info */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm px-4">
            <div className="px-3 sm:px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <span className="text-gray-400">Day (6 AM - 4 PM): </span>
              <span className="text-green-500 font-bold">₹{facility.hourlyRate}/hr</span>
            </div>
            <div className="px-3 sm:px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
              <span className="text-gray-400">Night (5 PM - 11 PM): </span>
              <span className="text-orange-500 font-bold">₹{facility.nightRate}/hr</span>
            </div>
          </div>
        </div>

        {/* Calendar Picker */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
            <h2 className="text-lg sm:text-2xl font-black">Select Playing Date</h2>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-lg sm:text-xl"
            >
              ←
            </button>
            <h3 className="text-base sm:text-xl font-bold">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-lg sm:text-xl"
            >
              →
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {dayNames.map((day, idx) => (
              <div key={idx} className="text-center text-xs sm:text-sm text-gray-500 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isPast = isDatePast(day);
              const isSelected = isDateSelected(day);
              
              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold transition-all
                    ${isPast ? 'text-gray-700 cursor-not-allowed' : 'hover:bg-gray-800 active:scale-95'}
                    ${isSelected ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50' : 'text-white'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Selected Date Display */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Selected Date</p>
            <p className="text-base sm:text-lg font-bold text-orange-500">
              {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Duration Selector */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
            <h2 className="text-lg sm:text-2xl font-black">Duration (Max 3 hours)</h2>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => setDuration(Math.max(1, duration - 1))}
              disabled={duration <= 1}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-800 hover:bg-gray-700 text-xl sm:text-2xl font-bold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              −
            </button>
            
            <div className="text-center min-w-[100px] sm:min-w-[120px]">
              <div className="text-4xl sm:text-5xl font-black text-orange-500">{duration}</div>
              <div className="text-sm sm:text-base text-gray-400 mt-1">hour(s)</div>
            </div>
            
            <button
              onClick={() => setDuration(Math.min(3, duration + 1))}
              disabled={duration >= 3}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-800 hover:bg-gray-700 text-xl sm:text-2xl font-bold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
            <h2 className="text-lg sm:text-2xl font-black">Available Time Slots</h2>
          </div>
          
          {availableSlots.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-5xl mb-4">😔</div>
              <p className="text-sm sm:text-base text-gray-500">No slots available for this date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {availableSlots.map((slot, index) => {
                const isRangeAvailable = isSlotRangeAvailable(slot);
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const hour = parseInt(slot.startTime.split(':')[0]);
                const isNight = hour >= 17;

                return (
                  <button
                    key={index}
                    onClick={() => isRangeAvailable && setSelectedSlot(slot)}
                    disabled={!isRangeAvailable}
                    className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all active:scale-95 ${
                      isSelected
                        ? 'border-orange-500 bg-gradient-to-r from-orange-500/20 to-pink-500/20 shadow-lg shadow-orange-500/50'
                        : isRangeAvailable
                        ? 'border-gray-700 bg-gray-800/50 hover:border-orange-500/50'
                        : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-bold text-base sm:text-lg">{formatTime(slot.startTime)}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{formatTime(slot.endTime)}</div>
                    <div className={`text-xs mt-1 font-semibold ${isNight ? 'text-orange-500' : 'text-green-500'}`}>
                      {slot.price ? formatCurrency(slot.price) : '₹0'}
                    </div>
                    {!isRangeAvailable && duration > 1 && (
                      <div className="text-xs text-red-400 mt-1">Not for {duration}h</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
            <h2 className="text-lg sm:text-2xl font-black">Booking Summary</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Selected Time Info */}
            {selectedSlot ? (
              <div className="p-3 sm:p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="text-orange-500 text-lg sm:text-xl">🕐</div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Selected Time</p>
                    <p className="font-bold text-sm sm:text-base">{formatTime(selectedSlot.startTime)} ({duration} hour{duration > 1 ? 's' : ''})</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center gap-2 sm:gap-3">
                <div className="text-gray-500 text-lg sm:text-xl">🕐</div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Selected Time</p>
                  <p className="text-sm sm:text-base text-gray-500">No slot selected</p>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div className="border-t border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4"></div>

            <div className="flex justify-between items-center">
              <span className="text-base sm:text-xl text-gray-400">Total Amount</span>
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                {selectedSlot ? formatCurrency(calculateTotalPrice()) : '₹0'}
              </span>
            </div>

            {/* Price Breakdown for multi-hour bookings */}
            {selectedSlot && duration > 1 && (
              <div className="text-xs sm:text-sm text-gray-500 mt-2 space-y-1">
                <p className="text-gray-400 font-semibold mb-1">Price Breakdown:</p>
                {Array.from({ length: duration }).map((_, i) => {
                  const hour = parseInt(selectedSlot.startTime.split(':')[0]) + i;
                  const isNight = hour >= 17;
                  const price = isNight ? facility.nightRate : facility.hourlyRate;
                  return (
                    <div key={i} className="flex justify-between">
                      <span>Hour {i + 1} ({hour}:00 - {hour + 1}:00):</span>
                      <span className={isNight ? 'text-orange-400' : 'text-green-400'}>
                        ₹{price} {isNight ? '(Night)' : '(Day)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pay Now Button */}
          <button
            onClick={handleBooking}
            disabled={!selectedSlot || loading}
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : !selectedSlot ? (
              'Select a Time Slot'
            ) : (
              <>
                <span>💳</span>
                <span>Pay ₹{calculateTotalPrice()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;