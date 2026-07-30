require('dotenv').config();
const axios = require('axios');

async function testFetchData() {
  try {
    const authRes = await axios.post(`${process.env.SANDBOX_BASE_URL}/authenticate`, {}, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'x-api-secret': process.env.SANDBOX_API_SECRET,
        'x-api-version': '1.0.0'
      }
    });
    const token = authRes.data.access_token;
    
    // First init a session to get a session_id
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
    
    const sessionId = initRes.data.data.session_id;
    console.log('Session ID:', sessionId);
    
    // Attempt to GET the session
    console.log('Fetching session data...');
    const getRes = await axios.get(`${process.env.SANDBOX_BASE_URL}/kyc/digilocker/sessions/${sessionId}`, {
      headers: {
        'x-api-key': process.env.SANDBOX_API_KEY,
        'Authorization': token,
        'x-api-version': '1.0.0'
      }
    });
    
    console.log('Data:', JSON.stringify(getRes.data, null, 2));
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
  }
}

testFetchData();
