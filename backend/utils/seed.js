const User = require('../models/User');
const Listing = require('../models/Listing');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Drop existing data to force the rich seed
    await User.deleteMany({});
    await Listing.deleteMany({});

    console.log('Seeding Database with Rich Mock Profiles and Listings...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        name: 'Arjun Reddy', email: 'arjun@example.com', passwordHash, gender: 'Male', age: 25, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', bio: 'Tech bro working in HSR. Love gaming and weekend drives.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Work Email',
        lifestyle: { sleepSchedule: 1, cleanliness: 4, socialHabits: 2, dietaryPref: 'Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 20000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Priya Sharma', email: 'priya@example.com', passwordHash, gender: 'Female', age: 23, occupationStatus: 'Student',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: 'Christ Univ student. Chill, extroverted, always down for coffee.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Student Email',
        lifestyle: { sleepSchedule: 5, cleanliness: 3, socialHabits: 5, dietaryPref: 'Non-Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 15000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Rohan Gupta', email: 'rohan@example.com', passwordHash, gender: 'Male', age: 27, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Consultant. Barely home, super neat when I am.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Government e-KYC',
        lifestyle: { sleepSchedule: 4, cleanliness: 5, socialHabits: 3, dietaryPref: 'Vegan', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 25000, preferredGender: 'Any' }
      },
      {
        name: 'Sneha Patel', email: 'sneha@example.com', passwordHash, gender: 'Female', age: 26, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', bio: 'Startup founder. I work late. Need a quiet place.',
        isEmailVerified: true, isIdentityVerified: false, verificationType: 'None',
        lifestyle: { sleepSchedule: 3, cleanliness: 2, socialHabits: 4, dietaryPref: 'Eggitarian', smoking: true },
        preferences: { targetCity: 'Bangalore', maxBudget: 18000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Vikram Singh', email: 'vikram@example.com', passwordHash, gender: 'Male', age: 24, occupationStatus: 'Student',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80', bio: 'Masters student. Early riser, very disciplined.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Student Email',
        lifestyle: { sleepSchedule: 2, cleanliness: 4, socialHabits: 1, dietaryPref: 'Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 12000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Aisha Khan', email: 'aisha@example.com', passwordHash, gender: 'Female', age: 25, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', bio: 'Designer. Love plants and art. Neat freak.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Work Email',
        lifestyle: { sleepSchedule: 2, cleanliness: 5, socialHabits: 2, dietaryPref: 'Vegan', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 22000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Karan Desai', email: 'karan@example.com', passwordHash, gender: 'Male', age: 28, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', bio: 'Gym bro. Meal preps. Easy going.',
        isEmailVerified: false, isIdentityVerified: false, verificationType: 'None',
        lifestyle: { sleepSchedule: 3, cleanliness: 3, socialHabits: 4, dietaryPref: 'Non-Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 15000, preferredGender: 'Any' }
      },
      {
        name: 'Neha Verma', email: 'neha@example.com', passwordHash, gender: 'Female', age: 22, occupationStatus: 'Student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', bio: 'New to the city! Looking for friendly flatmates.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Government e-KYC',
        lifestyle: { sleepSchedule: 4, cleanliness: 3, socialHabits: 5, dietaryPref: 'Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 10000, preferredGender: 'Same Gender Only' }
      },
      // New Users for expanded clustering tests
      {
        name: 'Anjali Rao', email: 'anjali@example.com', passwordHash, gender: 'Female', age: 24, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', bio: 'Product Manager. Very tidy, early to bed.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Work Email',
        lifestyle: { sleepSchedule: 1, cleanliness: 5, socialHabits: 2, dietaryPref: 'Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 22000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Rahul Khanna', email: 'rahul@example.com', passwordHash, gender: 'Male', age: 26, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80', bio: 'Software Engineer. Gamer, stay up late. Not very neat.',
        isEmailVerified: true, isIdentityVerified: false, verificationType: 'Work Email',
        lifestyle: { sleepSchedule: 5, cleanliness: 1, socialHabits: 4, dietaryPref: 'Non-Vegetarian', smoking: true },
        preferences: { targetCity: 'Bangalore', maxBudget: 18000, preferredGender: 'Any' }
      },
      {
        name: 'Meera Nair', email: 'meera@example.com', passwordHash, gender: 'Female', age: 27, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80', bio: 'Artist and freelancer. Super flexible and easygoing.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Government e-KYC',
        lifestyle: { sleepSchedule: 3, cleanliness: 3, socialHabits: 3, dietaryPref: 'Flexible', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 20000, preferredGender: 'Any' }
      },
      {
        name: 'Amit Kumar', email: 'amit@example.com', passwordHash, gender: 'Male', age: 22, occupationStatus: 'Student',
        avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80', bio: 'Engineering student. Looking for a quiet place to study.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Student Email',
        lifestyle: { sleepSchedule: 2, cleanliness: 4, socialHabits: 2, dietaryPref: 'Eggitarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 12000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Sara Jacob', email: 'sara@example.com', passwordHash, gender: 'Female', age: 25, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&q=80', bio: 'HR manager. Love hosting small dinners.',
        isEmailVerified: false, isIdentityVerified: true, verificationType: 'Government e-KYC',
        lifestyle: { sleepSchedule: 3, cleanliness: 4, socialHabits: 4, dietaryPref: 'Non-Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 24000, preferredGender: 'Same Gender Only' }
      },
      {
        name: 'Gaurav Das', email: 'gaurav@example.com', passwordHash, gender: 'Male', age: 29, occupationStatus: 'Working Professional',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', bio: 'Entrepreneur. Always working. Don\'t mind smokers.',
        isEmailVerified: true, isIdentityVerified: false, verificationType: 'Work Email',
        lifestyle: { sleepSchedule: 4, cleanliness: 3, socialHabits: 3, dietaryPref: 'Flexible', smoking: true },
        preferences: { targetCity: 'Bangalore', maxBudget: 28000, preferredGender: 'Any' }
      },
      {
        name: 'Pooja Iyer', email: 'pooja@example.com', passwordHash, gender: 'Female', age: 23, occupationStatus: 'Student',
        avatar: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80', bio: 'Law student. Strict vegetarian and very organized.',
        isEmailVerified: true, isIdentityVerified: true, verificationType: 'Student Email',
        lifestyle: { sleepSchedule: 2, cleanliness: 5, socialHabits: 1, dietaryPref: 'Vegetarian', smoking: false },
        preferences: { targetCity: 'Bangalore', maxBudget: 14000, preferredGender: 'Same Gender Only' }
      }
    ];

    const users = await User.insertMany(usersData);

    const listingsData = [
      {
        hostId: users[0]._id, title: 'Premium Private Room in Indiranagar', description: 'Fully furnished private room with attached bath in a 3BHK flat.',
        city: 'Bangalore', locality: 'Indiranagar', rentPerHead: 22000, depositPerHead: 50000, roomType: 'Single Private',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        amenities: ['Wi-Fi', 'AC', 'Washing Machine'],
        isVerifiedListing: true, isAvailable: true
      },
      {
        hostId: users[1]._id, title: 'Shared Room near Christ University', description: 'Looking for a female flatmate to share a spacious 2BHK. Very close to campus.',
        city: 'Bangalore', locality: 'Koramangala', rentPerHead: 12000, depositPerHead: 30000, roomType: 'Shared Room',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1e52d1590c?w=800&q=80'],
        amenities: ['Wi-Fi', 'Gym', 'Pool'],
        isVerifiedListing: true, isAvailable: true
      },
      {
        hostId: users[2]._id, title: 'Full 1BHK in HSR Layout Sector 2', description: 'Independent 1BHK suitable for a single professional. Quiet neighborhood.',
        city: 'Bangalore', locality: 'HSR Layout', rentPerHead: 25000, depositPerHead: 100000, roomType: 'Full Flat',
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ff6?w=800&q=80'],
        amenities: ['AC', 'Parking', 'Security'],
        isVerifiedListing: true, isAvailable: true
      },
      {
        hostId: users[5]._id, title: 'Cozy Room in Whitefield', description: 'Gated society with full amenities. Looking for a neat and quiet flatmate.',
        city: 'Bangalore', locality: 'Whitefield', rentPerHead: 18000, depositPerHead: 40000, roomType: 'Single Private',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
        amenities: ['Wi-Fi', 'Gym', 'Maid'],
        isVerifiedListing: true, isAvailable: true
      }
    ];

    await Listing.insertMany(listingsData);
    console.log('Database successfully seeded with Rich mock data!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
