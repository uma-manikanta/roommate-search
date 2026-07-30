const Listing = require('../models/Listing');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      city,
      locality,
      rentPerHead,
      depositPerHead,
      roomType,
      images,
      amenities
    } = req.body;

    const listing = await Listing.create({
      hostId: req.user.id,
      title,
      description,
      city,
      locality,
      rentPerHead,
      depositPerHead,
      roomType,
      images,
      amenities,
      isVerifiedListing: req.user.isIdentityVerified // Just as a simple fallback or rule
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const { city, maxRent, roomType, femaleShield, userGender } = req.query;

    let query = { isAvailable: true };
    if (city) query.city = new RegExp(city, 'i');
    if (maxRent) query.rentPerHead = { $lte: Number(maxRent) };
    if (roomType) query.roomType = roomType;

    let listings = await Listing.find(query).populate('hostId', 'name gender isIdentityVerified');
    
    if (femaleShield === 'true' && userGender === 'Female') {
      listings = listings.filter(l => l.hostId && l.hostId.gender === 'Female');
    }

    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('hostId', 'name isIdentityVerified linkedInUrl');
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user is the host
    if (listing.hostId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user is the host
    if (listing.hostId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Listing.deleteOne({ _id: listing._id });
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing
};
