import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config/api';
import toast from 'react-hot-toast';

interface Facility {
  _id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  hourlyRate: number;
  nightRate: number;
  isActive: boolean;
}

const FacilitiesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`${API_URL}/api/facilities`);
        const data = await response.json();
        
        if (data.success) {
          setFacilities(data.data);
        } else {
          toast.error('Failed to load facilities');
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        toast.error('Failed to load facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleBookNow = (facilityId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to book facilities');
      navigate('/login');
      return;
    }
    navigate(`/booking/${facilityId}`);
  };

  const getIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'cricket': '🏏',
      'football': '⚽',
      'badminton': '🏸',
      'volleyball': '🏐',
      'snooker': '🎱',
      'gym': '💪',
      'kids_zone': '🎮'
    };
    return icons[type] || '🏃';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4 animate-bounce">⚽</div>
          <p className="text-lg sm:text-xl text-gray-400">Loading facilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-4 sm:px-6 py-2 border border-orange-500/50 rounded-full mb-4 sm:mb-6 text-orange-500 text-xs sm:text-sm tracking-widest uppercase">
            Choose Your Sport
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4 px-4">
            Our <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Facilities</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Choose your favorite sport and book your slot
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {facilities.map((facility) => (
            <div
              key={facility._id}
              className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-500"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              {/* Icon Area */}
              <div className="h-40 sm:h-48 bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="text-6xl sm:text-7xl md:text-8xl relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                  {getIcon(facility.type)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 relative">
                <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-white">{facility.name}</h3>
                <p className="text-gray-400 text-sm mb-4 sm:mb-6 leading-relaxed">
                  {facility.description}
                </p>

                {/* Details */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="text-white font-semibold">{facility.capacity} people</span>
                  </div>

                  {facility.isActive ? (
                    <>
                      {facility.hourlyRate === facility.nightRate ? (
                        // Same price for day and night
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-gray-500">Rate:</span>
                          <span className="text-green-500 font-bold text-base sm:text-lg">₹{facility.hourlyRate}/hour</span>
                        </div>
                      ) : (
                        // Different prices for day and night
                        <>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <span className="text-gray-500">Day Rate:</span>
                            <span className="text-green-500 font-bold text-base sm:text-lg">₹{facility.hourlyRate}/hour</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <span className="text-gray-500">Night Rate:</span>
                            <span className="text-orange-500 font-bold text-base sm:text-lg">₹{facility.nightRate}/hour</span>
                          </div>
                        </>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {facility.hourlyRate === facility.nightRate 
                          ? 'Available 6:00 AM - 12:00 AM'
                          : 'Day: 6 AM - 4 PM | Night: 5 PM - 12 AM'
                        }
                      </div>
                    </>
                  ) : (
                    <div className="py-3 sm:py-4">
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
                        <span className="text-orange-500 animate-pulse">⏰</span>
                        <span className="text-orange-500 font-bold text-xs sm:text-sm">Coming Soon</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Button or Coming Soon */}
                {facility.isActive ? (
                  <button
                    onClick={() => handleBookNow(facility._id)}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 active:scale-95"
                  >
                    {isAuthenticated ? 'Book Now' : 'Login to Book'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-800 text-gray-500 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg cursor-not-allowed opacity-50"
                  >
                    Coming Soon
                  </button>
                )}
              </div>

              {/* Coming Soon Badge */}
              {!facility.isActive && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-lg">
                  COMING SOON
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesPage;