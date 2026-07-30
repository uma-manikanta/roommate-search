const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Non-Binary', 'Other'], required: true },
  age: { type: Number, required: true },
  occupationStatus: { type: String, enum: ['Student', 'Working Professional', 'Other'], required: true },
  organizationName: { type: String },
  avatar: { type: String },
  bio: { type: String },

  // Verification Flags
  isEmailVerified: { type: Boolean, default: false },
  emailOtp: { type: String },
  emailOtpExpires: { type: Date },
  isIdentityVerified: { type: Boolean, default: false },
  verificationType: { type: String, enum: ['Student Email', 'Work Email', 'Government e-KYC', 'Aadhaar Verified', 'None'], default: 'None' },
  verificationBadges: { type: [String], default: [] },
  verifiedDetails: { type: Object },
  linkedInUrl: { type: String },
  isLinkedInVerified: { type: Boolean, default: false },

  // Lifestyle Preferences (Scored 1-5)
  lifestyle: {
    sleepSchedule: { type: Number, min: 1, max: 5 }, // 1: Early Bird, 5: Night Owl
    cleanliness: { type: Number, min: 1, max: 5 },   // 1: Casual, 5: Neat Freak
    socialHabits: { type: Number, min: 1, max: 5 },  // 1: Introvert, 5: Extrovert
    dietaryPref: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggitarian', 'Flexible'] },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false }
  },

  // Search Preferences
  preferences: {
    targetCity: { type: String, required: true },
    maxBudget: { type: Number, required: true },
    preferredGender: { type: String, enum: ['Any', 'Same Gender Only'] },
    moveInDate: { type: Date }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
