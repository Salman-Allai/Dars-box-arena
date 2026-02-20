import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Booking } from '../types';
import { formatCurrency, formatTime } from '../lib/utils';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

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

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/bookings/my-bookings${filter !== 'all' ? `?status=${filter}` : ''}`);
      
      if (response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view bookings');
      navigate('/login');
      return;
    }
    loadBookings();
  }, [isAuthenticated, navigate, loadBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await api.patch(`/api/bookings/${bookingId}/cancel`);
      
      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        loadBookings();
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            My <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Bookings</span>
          </h1>
          <p className="text-gray-400">View and manage your facility bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold mb-2">No bookings found</h3>
            <p className="text-gray-400 mb-6">You haven't made any bookings yet</p>
            <button
              onClick={() => navigate('/facilities')}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/50 transition-all"
            >
              Browse Facilities
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {typeof booking.facilityId === 'object' ? booking.facilityId.name : 'Facility'}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>📅</span>
                        <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>🕐</span>
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>⏱️</span>
                        <span>{booking.duration} hour{booking.duration > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Amount */}
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        booking.bookingStatus === 'confirmed'
                          ? 'bg-green-500/20 text-green-500'
                          : booking.bookingStatus === 'cancelled'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                      <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-orange-500">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                  </div>

                  {/* Actions */}
                  {booking.bookingStatus === 'confirmed' && (
                    <div>
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;