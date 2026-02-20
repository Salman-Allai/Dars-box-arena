import Facility from '../models/Facility.js';

/**
 * Get all active facilities
 * GET /api/facilities?type=cricket|badminton|etc
 */
export const getAllFacilities = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    const facilities = await Facility.find(query).sort({ type: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
    
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching facilities',
      error: error.message
    });
  }
};

/**
 * Get facility by ID
 * GET /api/facilities/:id
 */
export const getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const facility = await Facility.findById(id);
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: facility
    });
    
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching facility details',
      error: error.message
    });
  }
};

/**
 * Get facilities grouped by type
 * GET /api/facilities/grouped
 */
export const getFacilitiesGrouped = async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true });
    
    const grouped = facilities.reduce((acc, facility) => {
      if (!acc[facility.type]) {
        acc[facility.type] = [];
      }
      acc[facility.type].push(facility);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: grouped
    });
    
  } catch (error) {
    console.error('Error fetching grouped facilities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching facilities',
      error: error.message
    });
  }
};