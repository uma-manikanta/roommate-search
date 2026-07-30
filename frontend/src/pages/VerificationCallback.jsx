import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const VerificationCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [status, setStatus] = useState('processing');
  
  useEffect(() => {
    const processCallback = async () => {
      // In a real Sandbox.co.in integration, the URL might contain a transaction_id or state
      // that we need to send to our backend to finalize the verification.
      // For this implementation, we will hit our POST /api/verify/digilocker endpoint
      // and pass a mock or extracted consentToken.
      
      const searchParams = new URLSearchParams(location.search);
      const sessionId = searchParams.get('session_id') || 'mock_session_123';
      
      try {
        const res = await api.post('/verify/digilocker', { consentToken: sessionId });
        
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        
        setStatus('success');
        
        // Redirect user to /profile after 2 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
        
      } catch (err) {
        console.error('DigiLocker Verification Finalization Failed', err);
        setStatus('error');
      }
    };

    if (user) {
      processCallback();
    } else {
      // If user isn't logged in, redirect to auth
      navigate('/auth');
    }
  }, [location, navigate, setUser, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center text-primary-900">
              <Loader size={48} className="animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Verifying identity with DigiLocker...</h2>
            <p className="text-sm text-gray-500">Securely communicating with Sandbox & UIDAI. Please wait.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4 animate-scale-in">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500 animate-bounce" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Identity verified successfully!</h2>
            <p className="text-green-600 font-medium">Your Aadhaar Verified badge has been issued.</p>
            <p className="text-xs text-gray-400">Redirecting you back to your profile...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center text-red-500">
              <X size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Verification failed or was cancelled</h2>
            <p className="text-sm text-gray-500">Something went wrong while processing your DigiLocker request.</p>
            <button onClick={() => navigate('/profile')} className="btn-primary w-full mt-4">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationCallback;
