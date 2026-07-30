const User = require('../models/User');

// @desc    Update user lifestyle and preferences
// @route   PUT /api/matches/lifestyle
// @access  Private
const updateLifestyle = async (req, res) => {
  try {
    console.log('Hitting updateLifestyle for user:', req.user.id);
    const { lifestyle, preferences } = req.body;

    const user = await User.findById(req.user.id);
    console.log('User found in DB:', user);

    if (!user) {
      return res.status(401).json({ message: 'Session expired or user not found. Please log in again.' });
    }

    if (lifestyle) user.lifestyle = { ...user.lifestyle, ...lifestyle };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      message: 'Lifestyle updated successfully',
      lifestyle: user.lifestyle,
      preferences: user.preferences
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get matches based on compatibility
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(401).json({ message: 'Session expired or user not found. Please log in again.' });
    }

    if (!currentUser.preferences || !currentUser.lifestyle) {
      return res.status(400).json({ message: 'Please complete your lifestyle questionnaire first.' });
    }

    // Find other users in the same target city
    const query = {
      _id: { $ne: currentUser._id },
      'preferences.targetCity': currentUser.preferences.targetCity
    };

    const potentialMatches = await User.find(query);

    const scoredMatches = [];

    for (const match of potentialMatches) {
      if (!match.lifestyle || !match.preferences) continue;

      // --- Hard Blocks ---
      
      // Female Safety Shield
      if (req.query.femaleShield === 'true' && currentUser.gender === 'Female' && match.gender !== 'Female') {
        continue;
      }

      // Gender Preference
      if (currentUser.preferences.preferredGender === 'Same Gender Only' && currentUser.gender !== match.gender) {
        continue;
      }
      if (match.preferences.preferredGender === 'Same Gender Only' && match.gender !== currentUser.gender) {
        continue;
      }

      // Budget check (just as an example, though often people negotiate)
      // if (match.preferences.maxBudget > currentUser.preferences.maxBudget * 1.5) continue; // just basic example

      // Strict Dietary Rules (Hard Block)
      const strictVeg = ['Vegetarian', 'Vegan'];
      const myDiet = currentUser.lifestyle.dietaryPref;
      const theirDiet = match.lifestyle.dietaryPref;

      const isDietHardBlock = 
        (strictVeg.includes(myDiet) && theirDiet === 'Non-Vegetarian') ||
        (strictVeg.includes(theirDiet) && myDiet === 'Non-Vegetarian');

      if (isDietHardBlock) {
        continue;
      }

      // Smoking Hard Block
      if (currentUser.lifestyle.smoking !== match.lifestyle.smoking) {
        continue;
      }

      // --- Compatibility Score Calculation ---
      // Compare 1-5 scalar values using normalized absolute distance
      const metrics = ['sleepSchedule', 'cleanliness', 'socialHabits'];
      let totalDistance = 0;
      let validMetrics = 0;

      for (const metric of metrics) {
        if (currentUser.lifestyle[metric] && match.lifestyle[metric]) {
          const diff = Math.abs(currentUser.lifestyle[metric] - match.lifestyle[metric]);
          totalDistance += diff;
          validMetrics += 1;
        }
      }

      let compatibilityPercentage = 0;
      if (validMetrics > 0) {
        // max distance per metric is 4 (e.g. 5 - 1). Total max distance = validMetrics * 4
        const maxPossibleDistance = validMetrics * 4;
        let normalizedScore = (maxPossibleDistance - totalDistance) / maxPossibleDistance;
        
        // Dietary Penalty for non-blocked mismatches (e.g. Eggitarian vs Flexible, or Vegan vs Vegetarian)
        if (myDiet !== theirDiet) {
           // Apply a 15% penalty for differing dietary preferences
           normalizedScore -= 0.15;
        }

        // Ensure score doesn't drop below 0
        if (normalizedScore < 0) normalizedScore = 0;

        compatibilityPercentage = Math.round(normalizedScore * 100);
      } else {
        compatibilityPercentage = 50; // default if no metrics
      }

      scoredMatches.push({
        user: {
          _id: match._id,
          name: match.name,
          gender: match.gender,
          age: match.age,
          occupationStatus: match.occupationStatus,
          isIdentityVerified: match.isIdentityVerified,
          isEmailVerified: match.isEmailVerified,
          verificationType: match.verificationType
        },
        compatibility: compatibilityPercentage
      });
    }

    // Sort by compatibility descending
    scoredMatches.sort((a, b) => b.compatibility - a.compatibility);

    res.json(scoredMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updateLifestyle,
  getMatches
};
