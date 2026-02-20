import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Facility from '../models/Facility.js';
import User from '../models/User.js';

dotenv.config();

const facilities = [
  {
    name: 'Cricket Net 1',
    type: 'cricket',
    description: 'Professional cricket practice net with high-quality turf and bowling machine',
    capacity: 6,
    hourlyRate: 500,
    amenities: ['Bowling Machine', 'Professional Turf', 'Lighting'],
    images: [],
    operatingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '23:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Cricket Net 2',
    type: 'cricket',
    description: 'Standard cricket practice net with quality playing surface',
    capacity: 6,
    hourlyRate: 400,
    amenities: ['Professional Turf', 'Lighting'],
    images: [],
    operatingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '23:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Badminton Court A',
    type: 'badminton',
    description: 'International standard badminton court with wooden flooring',
    capacity: 4,
    hourlyRate: 600,
    amenities: ['Wooden Floor', 'Air Conditioned', 'Professional Net'],
    images: [],
    operatingHours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '06:00', close: '23:00' },
      sunday: { open: '06:00', close: '23:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Badminton Court B',
    type: 'badminton',
    description: 'Standard badminton court with quality flooring',
    capacity: 4,
    hourlyRate: 500,
    amenities: ['Quality Floor', 'Air Conditioned', 'Professional Net'],
    images: [],
    operatingHours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '06:00', close: '23:00' },
      sunday: { open: '06:00', close: '23:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Volleyball Court',
    type: 'volleyball',
    description: 'Full-size indoor volleyball court with quality flooring',
    capacity: 12,
    hourlyRate: 800,
    amenities: ['Regulation Net', 'Quality Floor', 'Seating'],
    images: [],
    operatingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '23:00' }
    },
    slotDuration: 90
  },
  {
    name: 'Snooker Table 1',
    type: 'snooker',
    description: 'Professional snooker table in quiet, air-conditioned room',
    capacity: 2,
    hourlyRate: 300,
    amenities: ['Professional Table', 'Air Conditioned', 'Quality Cues'],
    images: [],
    operatingHours: {
      monday: { open: '10:00', close: '23:00' },
      tuesday: { open: '10:00', close: '23:00' },
      wednesday: { open: '10:00', close: '23:00' },
      thursday: { open: '10:00', close: '23:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '23:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Snooker Table 2',
    type: 'snooker',
    description: 'Standard snooker table for casual play',
    capacity: 2,
    hourlyRate: 250,
    amenities: ['Quality Table', 'Air Conditioned', 'Good Cues'],
    images: [],
    operatingHours: {
      monday: { open: '10:00', close: '23:00' },
      tuesday: { open: '10:00', close: '23:00' },
      wednesday: { open: '10:00', close: '23:00' },
      thursday: { open: '10:00', close: '23:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '23:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Gym Area',
    type: 'gym',
    description: 'Fully equipped gym with modern fitness equipment',
    capacity: 20,
    hourlyRate: 200,
    amenities: ['Cardio Machines', 'Free Weights', 'Trainer Available', 'Air Conditioned'],
    images: [],
    operatingHours: {
      monday: { open: '05:00', close: '23:00' },
      tuesday: { open: '05:00', close: '23:00' },
      wednesday: { open: '05:00', close: '23:00' },
      thursday: { open: '05:00', close: '23:00' },
      friday: { open: '05:00', close: '23:00' },
      saturday: { open: '06:00', close: '22:00' },
      sunday: { open: '06:00', close: '22:00' }
    },
    slotDuration: 60
  },
  {
    name: 'Kids Gaming Zone',
    type: 'kids_zone',
    description: 'Safe and fun gaming area for children with various activities',
    capacity: 15,
    hourlyRate: 300,
    amenities: ['Video Games', 'Board Games', 'Supervised', 'Air Conditioned'],
    images: [],
    operatingHours: {
      monday: { open: '14:00', close: '21:00' },
      tuesday: { open: '14:00', close: '21:00' },
      wednesday: { open: '14:00', close: '21:00' },
      thursday: { open: '14:00', close: '21:00' },
      friday: { open: '14:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' }
    },
    slotDuration: 60
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dars-box-arena');
    
    console.log('🔗 Connected to MongoDB');
    
    // Clear existing facilities
    await Facility.deleteMany({});
    console.log('🗑️  Cleared existing facilities');
    
    // Insert new facilities
    const createdFacilities = await Facility.insertMany(facilities);
    console.log(`✅ Created ${createdFacilities.length} facilities`);
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@darsbox.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@darsbox.com',
        phone: '+971501234567',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Created admin user (email: admin@darsbox.com, password: admin123)');
    }
    
    console.log('\n✨ Database seeded successfully!');
    console.log('\nFacilities created:');
    createdFacilities.forEach((facility, index) => {
      console.log(`  ${index + 1}. ${facility.name} (${facility.type}) - ₹${facility.hourlyRate}/hour`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();