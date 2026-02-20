import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedFacilities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('facilities');
    
    // Clear existing facilities
    await collection.deleteMany({});
    console.log('🗑️ Cleared existing facilities\n');
    
    // Standard operating hours for most facilities (6 AM - 11 PM, all days)
    const standardHours = {
      monday: { open: '06:00', close: '23:00', closed: false },
      tuesday: { open: '06:00', close: '23:00', closed: false },
      wednesday: { open: '06:00', close: '23:00', closed: false },
      thursday: { open: '06:00', close: '23:00', closed: false },
      friday: { open: '06:00', close: '23:00', closed: false },
      saturday: { open: '06:00', close: '23:00', closed: false },
      sunday: { open: '06:00', close: '23:00', closed: false }
    };
    
    // Create new facilities
    const facilities = [
      {
        name: 'Box Cricket',
        type: 'cricket',
        description: 'Indoor turf ground perfect for box cricket matches with quality surface and boundary markings',
        capacity: 12,
        hourlyRate: 1200,
        nightRate: 1600,
        slotDuration: 60, // 60 minutes per slot
        amenities: ['Turf Ground', 'Boundary Markings', 'Quality Surface'],
        operatingHours: standardHours,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Football 7-a-side',
        type: 'football',
        description: 'Professional 7-a-side football turf with FIFA-standard surface and floodlights',
        capacity: 14,
        hourlyRate: 1200,
        nightRate: 1600,
        slotDuration: 60,
        amenities: ['FIFA Standard Turf', 'Floodlights', 'Goal Posts'],
        operatingHours: standardHours,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Badminton',
        type: 'badminton',
        description: 'International standard courts on turf with proper lighting for competitive play',
        capacity: 4,
        hourlyRate: 600,
        nightRate: 600,
        slotDuration: 60,
        amenities: ['Turf Courts', 'Professional Nets', 'Quality Lighting'],
        operatingHours: standardHours,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Volleyball',
        type: 'volleyball',
        description: 'Full-size indoor court with spectator seating and quality net setup',
        capacity: 12,
        hourlyRate: 1000,
        nightRate: 1000,
        slotDuration: 60,
        amenities: ['Full Court', 'Spectator Seating', 'Quality Net'],
        operatingHours: standardHours,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Snooker',
        type: 'snooker',
        description: 'Premium tables in quiet, air-conditioned rooms for focused gameplay',
        capacity: 2,
        hourlyRate: 300,
        nightRate: 300,
        slotDuration: 60,
        amenities: ['Premium Tables', 'Air Conditioned', 'Quiet Room'],
        operatingHours: {
          monday: { open: '10:00', close: '22:00', closed: false },
          tuesday: { open: '10:00', close: '22:00', closed: false },
          wednesday: { open: '10:00', close: '22:00', closed: false },
          thursday: { open: '10:00', close: '22:00', closed: false },
          friday: { open: '10:00', close: '22:00', closed: false },
          saturday: { open: '10:00', close: '22:00', closed: false },
          sunday: { open: '10:00', close: '22:00', closed: false }
        },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gym',
        type: 'gym',
        description: 'Modern equipment with certified personal trainers and complete workout facilities',
        capacity: 20,
        hourlyRate: 500,
        nightRate: 500,
        slotDuration: 60,
        amenities: ['Modern Equipment', 'Personal Trainers', 'Locker Room'],
        operatingHours: {
          monday: { open: '05:00', close: '23:00', closed: false },
          tuesday: { open: '05:00', close: '23:00', closed: false },
          wednesday: { open: '05:00', close: '23:00', closed: false },
          thursday: { open: '05:00', close: '23:00', closed: false },
          friday: { open: '05:00', close: '23:00', closed: false },
          saturday: { open: '05:00', close: '23:00', closed: false },
          sunday: { open: '05:00', close: '23:00', closed: false }
        },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kids Zone',
        type: 'kids_zone',
        description: 'Safe supervised gaming and play area designed for children\'s entertainment',
        capacity: 15,
        hourlyRate: 400,
        nightRate: 400,
        slotDuration: 60,
        amenities: ['Safe Play Area', 'Supervised', 'Fun Games'],
        operatingHours: {
          monday: { open: '09:00', close: '21:00', closed: false },
          tuesday: { open: '09:00', close: '21:00', closed: false },
          wednesday: { open: '09:00', close: '21:00', closed: false },
          thursday: { open: '09:00', close: '21:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '09:00', close: '21:00', closed: false },
          sunday: { open: '09:00', close: '21:00', closed: false }
        },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await collection.insertMany(facilities);
    console.log(`✅ Created ${result.insertedCount} facilities:\n`);
    
    // Show created facilities
    const allFacilities = await collection.find({}).toArray();
    allFacilities.forEach(f => {
      console.log(`📋 ${f.name}`);
      console.log(`   ID: ${f._id}`);
      console.log(`   Type: ${f.type}`);
      console.log(`   Hours: ${f.operatingHours.monday.open} - ${f.operatingHours.monday.close}`);
      console.log(`   Slot Duration: ${f.slotDuration} minutes`);
      console.log(`   Day: ₹${f.hourlyRate}/hour | Night: ₹${f.nightRate}/hour`);
      console.log(`   Status: ${f.isActive ? 'ACTIVE ✅' : 'Coming Soon 🔜'}`);
      console.log('');
    });
    
    console.log('✅ Database seeded successfully!\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedFacilities();