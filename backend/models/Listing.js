const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  city: { type: String, required: true },
  locality: { type: String, required: true },
  rentPerHead: { type: Number, required: true },
  depositPerHead: { type: Number, required: true },
  roomType: { type: String, enum: ['Single Private', 'Shared Room', 'Full Flat'], required: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  isVerifiedListing: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
