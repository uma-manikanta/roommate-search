// backend/test-digilocker.js
require('dotenv').config();
const axios = require('axios');

async function debugDigiLocker() {
    const BASE_URL = process.env.SANDBOX_BASE_URL || 'https://test-api.sandbox.co.in';
    console.log('🔍 Testing Sandbox DigiLocker Integration...');
    console.log('• BASE_URL:', BASE_URL);

    try {
        // 1. Authenticate to get Access Token
        console.log('\n⏳ Step 1: Fetching Sandbox Access Token...');
        const authRes = await axios.post(
            `${BASE_URL}/authenticate`,
            {},
            {
                headers: {
                    'x-api-key': process.env.SANDBOX_API_KEY,
                    'x-api-secret': process.env.SANDBOX_API_SECRET,
                    'x-api-version': '1.0.0',
                    'Content-Type': 'application/json'
                }
            }
        );

        const accessToken = authRes.data.data?.access_token || authRes.data.access_token;
        console.log('✅ Access Token Received!');

        // 2. Initiate DigiLocker Session with Exact Saved Test Example
        console.log('\n⏳ Step 2: Initiating DigiLocker Test Session...');
        const sessionRes = await axios.post(
            `${BASE_URL}/kyc/digilocker/sessions/init`,
            {
                '@entity': 'in.co.sandbox.kyc.digilocker.sdk.session.request',
                flow: 'signin',
                redirect_url: 'https://developer.sandbox.co.in/',
                doc_types: ['aadhaar'],
                options: {
                    verification_method: ['aadhaar'],
                    pinless: true,
                    usernameless: true,
                    verified_mobile: '9687205427'
                }
            },
            {
                headers: {
                    'Authorization': accessToken,
                    'x-api-key': process.env.SANDBOX_API_KEY,
                    'x-api-version': '1.0.0',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\n🎉 SUCCESS! DigiLocker Session Created:');
        console.log('• Session ID:', sessionRes.data.data?.session_id);
        console.log('• Authorization URL:\n', sessionRes.data.data?.authorization_url);

    } catch (error) {
        console.error('\n❌ DEBUG ERROR:');
        if (error.response) {
            console.error('• Status Code:', error.response.status);
            console.error('• Response Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('• Error Message:', error.message);
        }
    }
}

debugDigiLocker();