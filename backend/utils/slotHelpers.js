/**
 * Generates all possible time slots for a facility on a given date
 * @param {Object} facility - Facility document
 * @param {Date} date - The date to generate slots for
 * @returns {Array} Array of time slot objects {startTime, endTime, duration}
 */
export const generateTimeSlots = (facility, date) => {
  const slots = [];
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  
  const operatingHours = facility.operatingHours[dayOfWeek];
  
  // Check if facility is closed on this day
  if (!operatingHours || operatingHours.closed) {
    return slots;
  }
  
  const openTime = operatingHours.open; // e.g., "09:00"
  const closeTime = operatingHours.close; // e.g., "22:00"
  const slotDuration = facility.slotDuration; // in minutes
  
  // Parse opening and closing times
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  // Start from opening time
  let currentHour = openHour;
  let currentMin = openMin;
  
  while (true) {
    const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Calculate end time
    let endMin = currentMin + slotDuration;
    let endHour = currentHour;
    
    if (endMin >= 60) {
      endHour += Math.floor(endMin / 60);
      endMin = endMin % 60;
    }
    
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    
    // Check if end time exceeds closing time
    if (endHour > closeHour || (endHour === closeHour && endMin > closeMin)) {
      break;
    }
    
    slots.push({
      startTime,
      endTime,
      duration: slotDuration
    });
    
    // Move to next slot
    currentMin += slotDuration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
};

/**
 * Checks if two time ranges overlap
 * @param {String} start1 - Start time of first range (HH:MM)
 * @param {String} end1 - End time of first range (HH:MM)
 * @param {String} start2 - Start time of second range (HH:MM)
 * @param {String} end2 - End time of second range (HH:MM)
 * @returns {Boolean} True if ranges overlap
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

/**
 * Formats a date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {String}
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a date is in the past
 * @param {Date} date 
 * @returns {Boolean}
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Calculates the total amount for a booking
 * @param {Number} hourlyRate 
 * @param {Number} duration - in minutes
 * @returns {Number}
 */
export const calculateBookingAmount = (hourlyRate, duration) => {
  return (hourlyRate * duration) / 60;
};

/**
 * Generates a unique booking reference
 * @returns {String}
 */
export const generateBookingReference = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `DB-${timestamp}-${random}`.toUpperCase();
};