import React, { useState, useContext, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const DigiLockerModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifier('');
      setPin('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConsent = async () => {
    try {
      setLoading(true);
      // Pass a mock token to our new endpoint
      const res = await api.post('/verify/digilocker', { consentToken: 'mock_digilocker_token_456' });
      
      // Update global user state with the returned user object
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      setStep(3); // Success State
      
      // Close modal automatically after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error(err);
      alert('Failed to verify via DigiLocker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        
        {/* Official DigiLocker Header */}
        <div className="bg-[#1a237e] text-white p-4 flex items-center justify-between shadow-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/DigiLocker_Logo.png" alt="DigiLocker" className="h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight">DigiLocker</h2>
              <p className="text-[10px] text-blue-200">A Govt. of India Initiative</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 relative bg-gray-50 flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-gray-800">Sign In to your account</h3>
                <p className="text-sm text-gray-500">Access your digital documents</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Aadhaar / Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="12-digit Aadhaar or 10-digit Mobile" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-[#1a237e] focus:border-[#1a237e]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">6 Digit Security PIN</label>
                  <input 
                    type="password" 
                    placeholder="••••••" 
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-center tracking-widest text-xl focus:ring-[#1a237e] focus:border-[#1a237e]" 
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!identifier || pin.length < 6}
                className="w-full bg-[#1a237e] hover:bg-[#121858] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="flex justify-center mb-2">
                <ShieldCheck size={48} className="text-[#1a237e]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Permission Request</h3>
              <p className="text-sm text-gray-600 border border-blue-100 bg-blue-50 p-4 rounded-lg">
                <strong className="text-primary-900 block mb-2">NestMatch requests access to:</strong>
                Name, Date of Birth, Gender, and Address from UIDAI.
              </p>
              
              <div className="flex items-center text-xs text-gray-500 text-left bg-gray-100 p-3 rounded">
                <p>By clicking Allow, you consent to share these details with NestMatch for identity verification purposes.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100">
                  Deny
                </button>
                <button onClick={handleConsent} disabled={loading} className="flex-1 py-2.5 bg-[#1a237e] text-white rounded-lg font-medium hover:bg-[#121858]">
                  {loading ? 'Processing...' : 'Allow'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-scale-in text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-500 animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Identity Verified via DigiLocker</h3>
              <p className="text-green-600 font-medium">Your Aadhaar Verified badge has been issued.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigiLockerModal;
