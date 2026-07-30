const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, gender, age, occupationStatus, targetCity, maxBudget } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    console.log(`🔑 DEV OTP for ${email}: ${otp}`);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      gender,
      age,
      occupationStatus,
      preferences: {
        targetCity,
        maxBudget
      },
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    if (user) {
      await sendEmail({
        email: user.email,
        subject: 'Roommate Finder - Verify your email',
        message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      });

      res.status(201).json({ requireVerification: true, email: user.email });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (!user.isEmailVerified) {
        const otp = generateOTP();
        console.log(`🔑 DEV OTP for ${email}: ${otp}`);
        
        user.emailOtp = otp;
        user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendEmail({
          email: user.email,
          subject: 'Roommate Finder - Verify your email',
          message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
        });

        return res.json({ requireVerification: true, email: user.email });
      }

      const userObj = user.toObject();
      delete userObj.passwordHash;
      userObj.token = generateToken(user._id);
      res.json(userObj);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > user.emailOtpExpires) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    userObj.token = generateToken(user._id);
    res.json(userObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-email-otp
// @access  Public
const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otp = generateOTP();
    console.log(`🔑 DEV OTP for ${email}: ${otp}`);

    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Roommate Finder - Verify your email',
      message: `Your new verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmailOtp,
  resendEmailOtp
};
