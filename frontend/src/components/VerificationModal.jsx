import React, { useState, useContext } from 'react';
import { X, CheckCircle, Mail, Briefcase, FileSignature, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const VerificationModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await api.post('/verify/email/send', { email });
      setStep(2);
    } catch (err) {
      alert('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const res = await api.post('/verify/email/confirm', { email, otp });
      alert(res.data.message);
      
      const updatedUser = { ...user, isEmailVerified: true, verificationType: res.data.verificationType };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onClose();
    } catch (err) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Aadhaar states
  const handleDigiLocker = async () => {
    try {
      setLoading(true);
      const res = await api.post('/verify/digilocker/initiate');
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate DigiLocker. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="p-6 bg-primary-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle size={20} className="text-success-500" />
              Verification Center
            </h2>
            <p className="text-sm text-gray-300 mt-1">Boost your profile trust score to get 3x more matches.</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => { setActiveTab('student'); setStep(1); }}
              className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${activeTab === 'student' ? 'border-primary-900 text-primary-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Mail size={16} /> Edu Email
            </button>
            <button 
              onClick={() => { setActiveTab('work'); setStep(1); }}
              className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${activeTab === 'work' ? 'border-primary-900 text-primary-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Briefcase size={16} /> Work Email
            </button>
            <button 
              onClick={() => { setActiveTab('aadhaar'); }}
              className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 ${activeTab === 'aadhaar' ? 'border-primary-900 text-primary-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileSignature size={16} /> DigiLocker
            </button>
          </div>

          {activeTab === 'student' || activeTab === 'work' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {activeTab === 'student' ? 'Verify your university email (.edu, .ac.in) to get the [Edu Verified] badge.' : 'Verify your corporate email to get the [Work Verified] badge.'}
              </p>
              
              {step === 1 ? (
                <>
                  <input type="email" placeholder="name@domain.com" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button onClick={handleSendOTP} disabled={!email || loading} className="btn-primary w-full">
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="6-digit OTP" className="input-field text-center text-xl tracking-widest" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button onClick={handleVerifyOTP} disabled={!otp || loading} className="btn-primary w-full">
                    {loading ? 'Verifying...' : 'Confirm OTP'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <p className="text-sm text-gray-600">
                Securely fetch your official Aadhaar details through DigiLocker to instantly receive the highly trusted [Aadhaar Verified] badge.
              </p>
              
              <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg">
                <button 
                  onClick={handleDigiLocker} 
                  disabled={loading} 
                  className="bg-[#2A3469] hover:bg-[#1E2651] text-white font-medium w-full py-3 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/DigiLocker_Logo.png" alt="DigiLocker" className="h-6 bg-white p-0.5 rounded" />
                  {loading ? 'Connecting...' : 'Verify with DigiLocker'}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
                <ShieldCheck size={14} /> We do not store your Aadhaar number.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
