require('dotenv').config();
const axios = require('axios');

async function testSandbox() {
  try {
    console.log('Authenticating with Sandbox...');
    const authRes = await axios.post(`${process.env.SANDBOX_BASE_URL}/authenticate`, {}, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'x-api-secret': process.env.SANDBOX_API_SECRET,
        'x-api-version': '1.0.0'
      }
    });
    const token = authRes.data.access_token;
    console.log('Token acquired:', token);
    
    console.log('Initiating DigiLocker...');
    const initRes = await axios.post(`${process.env.SANDBOX_BASE_URL}/kyc/digilocker/sessions/init`, {
      "@entity": "in.co.sandbox.kyc.digilocker.session.request",
      "flow": "signin",
      "redirect_url": "http://localhost:5173/verification/callback",
      "doc_types": ["aadhaar"]
    }, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'Authorization': token,
        'x-api-version': '1.0.0'
      }
    });
    
    console.log('Success!', initRes.data);
  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

testSandbox();
