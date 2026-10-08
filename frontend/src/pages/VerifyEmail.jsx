import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const { showAlert } = useDialog();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      navigate('/auth');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-email-otp', { email, otp });
      
      const userData = res.data;
      
      // Save auth state
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Manually set api header here since the context state might not be updated fast enough for the next call
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

      // Check if there is pending lifestyle data to save
      const pendingLifestyleStr = localStorage.getItem('pendingLifestyle');
      if (pendingLifestyleStr) {
        try {
          const pendingLifestyle = JSON.parse(pendingLifestyleStr);
          await api.put('/matches/lifestyle', pendingLifestyle);
          localStorage.removeItem('pendingLifestyle');
        } catch (err) {
          console.error('Failed to save pending lifestyle data', err);
        }
      }

      navigate('/matches');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      await api.post('/auth/resend-email-otp', { email });
      setCountdown(60);
      setError('');
      showAlert('A new verification code has been sent to your email.', 'Code Resent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-6 animate-fade-in relative">
        <button 
          onClick={() => navigate('/auth', { state: location.state })} 
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex justify-center pt-2">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <Mail size={32} />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
          <p className="text-gray-500 mt-2">
            We've sent a 6-digit verification code to <br />
            <span className="font-semibold text-gray-800">{email}</span>
            <button 
              onClick={() => navigate('/auth', { state: location.state })}
              className="ml-2 text-xs text-primary-600 hover:text-primary-800 underline"
            >
              (Edit)
            </button>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="block w-full text-center text-3xl tracking-widest font-mono py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : (
              <>
                <ShieldCheck size={20} /> Verify Email
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Didn't receive the code?</p>
          <p className="text-xs text-gray-400 mb-3">(Check your spam folder just in case)</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`flex items-center justify-center gap-1 w-full py-2 text-sm font-medium transition-colors ${
              countdown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-primary-600 hover:text-primary-800'
            }`}
          >
            <RefreshCw size={16} className={countdown === 0 ? '' : 'opacity-50'} />
            {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
