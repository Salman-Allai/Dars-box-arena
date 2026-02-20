export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff';
}

export interface Facility {
  _id: string;
  name: string;
  type: 'cricket' | 'football' | 'badminton' | 'volleyball' | 'snooker' | 'gym' | 'kids_zone';
  description: string;
  capacity: number;
  hourlyRate: number;
  nightRate: number; // ✅ ADDED
  amenities: string[];
  images?: string[];
  slotDuration: number;
  isActive: boolean; // ✅ ADDED
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  isAvailable: boolean; // ✅ ADDED
}

export interface Booking {
  _id: string;
  facilityId: Facility;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  numberOfPeople: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  qrCode?: string;
}

// Auth Response Type
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// Availability Response
export interface AvailabilityResponse {
  success: boolean;
  data: {
    facilityId: string;
    facilityName: string;
    facilityType: string;
    date: string;
    hourlyRate: number;
    nightRate: number; // ✅ ADDED
    slotDuration: number;
    totalSlots: number;
    availableSlots: TimeSlot[];
    bookedSlots: number;
    slots: TimeSlot[]; // ✅ ADDED (backend uses this)
  };
}

// Booking Form Data
export interface BookingFormData {
  facilityId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  numberOfPeople: number;
  paymentMethod: 'online' | 'cash' | 'card';
  totalAmount?: number; // ✅ ADDED
  notes?: string;
}