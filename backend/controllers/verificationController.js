const Otp = require('../models/Otp');
const User = require('../models/User');
const { getSandboxAccessToken } = require('../services/sandboxService');
const axios = require('axios');
const sendEmail = require('../utils/emailService');

// @desc    Send Email OTP
// @route   POST /api/verify/email/send
// @access  Private
const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if domain is .edu, .ac.in, or generic work (mock check)
    const validDomains = ['.edu', '.ac.in', 'work.com', 'company.com'];
    const isDomainValid = validDomains.some(domain => email.endsWith(domain));

    if (!isDomainValid) {
       // In a real app we'd validate against a known list of domains
       // For mock purposes, let's just log a warning but allow it, 
       // or strict enforce it:
       // return res.status(400).json({ message: 'Invalid domain. Must be a .edu or recognized work domain.' });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await Otp.create({
      userId: req.user.id,
      email,
      otp: otpCode
    });

    // Send email
    const message = `Your Roommate Matcher Verification OTP is: ${otpCode}. It will expire in 5 minutes.`;
    await sendEmail({
      email,
      subject: 'Roommate Matcher - Email Verification',
      message
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/verify/email/confirm
// @access  Private
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ userId: req.user.id, email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user
    const user = await User.findById(req.user.id);
    user.isEmailVerified = true;
    user.verificationType = email.includes('.edu') || email.includes('.ac.in') ? 'Student Email' : 'Work Email';
    await user.save();

    // Clean up OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'Email verified successfully', verificationType: user.verificationType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Aadhaar Offline XML / e-KYC (Mock)
// @route   POST /api/verify/ekyc
// @access  Private
const verifyAadhaarEKYC = async (req, res) => {
  try {
    const { aadhaarNumber, xmlData } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ message: 'Aadhaar number is required' });
    }

    // MOCK e-KYC logic
    // In a real scenario, we would parse the Offline XML, verify the signature, and match the name/DOB with the user's profile.

    const user = await User.findById(req.user.id);
    user.isIdentityVerified = true;
    user.verificationType = 'Government e-KYC';
    await user.save();

    res.status(200).json({ message: 'e-KYC verified successfully (Mock)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify with DigiLocker (Mock OAuth callback)
// @route   POST /api/verify/digilocker
// @access  Private
const verifyDigiLocker = async (req, res) => {
  try {
    const { consentToken } = req.body;

    if (!consentToken) {
      return res.status(400).json({ message: 'Missing DigiLocker consent token' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    user.isIdentityVerified = true;
    user.verificationType = 'Aadhaar Verified';
    
    // Add badge if it doesn't exist
    if (!user.verificationBadges) user.verificationBadges = [];
    if (!user.verificationBadges.includes('Aadhaar Verified')) {
      user.verificationBadges.push('Aadhaar Verified');
    }
    
    // Fetch actual details from Sandbox API
    let fetchedDetails = {};

    const accessToken = await getSandboxAccessToken();
    
    // Get the document download URL
    const docRes = await axios.get(`${process.env.SANDBOX_BASE_URL}/kyc/digilocker/sessions/${consentToken}/documents/aadhaar`, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'Authorization': accessToken,
        'x-api-version': '1.0.0'
      }
    });

    const fileUrl = docRes.data?.data?.files?.[0]?.url;
    
    if (fileUrl) {
      // Download the XML
      const xmlRes = await axios.get(fileUrl);
      const xmlData = xmlRes.data;
      
      // Parse Poi (Proof of Identity)
      const nameMatch = xmlData.match(/name="([^"]+)"/);
      const dobMatch = xmlData.match(/dob="([^"]+)"/);
      const genderMatch = xmlData.match(/gender="([^"]+)"/);
      
      if (nameMatch) fetchedDetails.name = nameMatch[1];
      if (dobMatch) fetchedDetails.dob = dobMatch[1];
      if (genderMatch) {
        const g = genderMatch[1];
        fetchedDetails.gender = g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other';
      }
      
      // Parse Poa (Proof of Address)
      const poaMatch = xmlData.match(/<Poa\s+([^>]+)>/);
      if (poaMatch) {
        const poaStr = poaMatch[1];
        const extractAttr = (attr) => {
          const m = poaStr.match(new RegExp(`${attr}="([^"]+)"`));
          return m ? m[1] : '';
        };
        
        const house = extractAttr('house');
        const street = extractAttr('street');
        const dist = extractAttr('dist');
        const state = extractAttr('state');
        const pc = extractAttr('pc');
        
        fetchedDetails.address = [house, street, dist, state, pc].filter(Boolean).join(', ');
      }
    } else {
      throw new Error("Sandbox API did not return a valid document file URL.");
    }
    
    fetchedDetails.kycProvider = 'Sandbox UIDAI API';
    
    user.verifiedDetails = fetchedDetails;

    await user.save();

    res.status(200).json({ 
      message: 'DigiLocker verification successful',
      user: {
        ...user._doc,
        passwordHash: undefined
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Initiate Sandbox DigiLocker Auth
// @route   POST /api/verify/digilocker/initiate
// @access  Private
const initiateDigiLocker = async (req, res) => {
  try {
    const accessToken = await getSandboxAccessToken();
    
    const response = await axios.post(`${process.env.SANDBOX_BASE_URL}/kyc/digilocker/sessions/init`, {
      "@entity": "in.co.sandbox.kyc.digilocker.session.request",
      "flow": "signin",
      "redirect_url": "http://localhost:5173/verification/callback",
      "doc_types": ["aadhaar"]
    }, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'Authorization': accessToken,
        'x-api-version': '1.0.0'
      }
    });

    res.status(200).json({
      authorization_url: response.data.data.authorization_url,
      session_id: response.data.data.session_id
    });
  } catch (error) {
    console.error('Error initiating DigiLocker:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate DigiLocker verification' });
  }
};

module.exports = {
  sendEmailOTP,
  verifyEmailOTP,
  verifyAadhaarEKYC,
  initiateDigiLocker,
  verifyDigiLocker
};
