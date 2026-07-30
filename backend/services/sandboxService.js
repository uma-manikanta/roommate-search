const axios = require('axios');

// In-memory token cache
let cachedToken = null;
let tokenExpiry = null;

/**
 * Gets a valid Sandbox Access Token.
 * Caches the token for 24 hours to prevent unnecessary auth calls.
 */
const getSandboxAccessToken = async () => {
  try {
    // Return cached token if valid (buffer of 5 mins)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
      return cachedToken;
    }

    const res = await axios.post(`${process.env.SANDBOX_BASE_URL}/authenticate`, {}, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'x-api-secret': process.env.SANDBOX_API_SECRET,
        'x-api-version': '1.0.0'
      }
    });

    cachedToken = res.data.access_token;
    
    // Sandbox tokens typically expire in 24 hours (86400 seconds)
    // We set expiry to current time + 24h
    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('Sandbox Authentication Failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Sandbox API');
  }
};

module.exports = {
  getSandboxAccessToken
};
