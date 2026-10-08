import React, { useState, useContext, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, Calendar, Briefcase, MapPin, IndianRupee, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const Auth = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [step, setStep] = useState(location.state?.step ?? 1);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState(location.state?.formData || {
    name: '', email: '', password: '', age: '', gender: 'Male', occupationStatus: 'Student',
    sleepSchedule: 3, cleanliness: 3, socialHabits: 3, dietaryPref: 'Flexible', smoking: false,
    targetCity: '', maxBudget: '', preferredGender: 'Any'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.age) {
      setError('Please fill all basic details');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const authData = await login(formData.email, formData.password);
        if (authData.requireVerification) {
          navigate(`/verify-email?email=${encodeURIComponent(authData.email)}`, { state: { formData, isLogin, step } });
          return;
        }
        navigate('/matches');
      } else {
        const authData = await register({
          name: formData.name, email: formData.email, password: formData.password,
          gender: formData.gender, age: Number(formData.age), occupationStatus: formData.occupationStatus,
          targetCity: formData.targetCity, maxBudget: Number(formData.maxBudget)
        });
        
        const lifestyleData = {
          lifestyle: {
            sleepSchedule: Number(formData.sleepSchedule),
            cleanliness: Number(formData.cleanliness),
            socialHabits: Number(formData.socialHabits),
            dietaryPref: formData.dietaryPref,
            smoking: formData.smoking
          },
          preferences: {
            targetCity: formData.targetCity,
            maxBudget: Number(formData.maxBudget),
            preferredGender: formData.preferredGender
          }
        };

        if (authData.requireVerification) {
          localStorage.setItem('pendingLifestyle', JSON.stringify(lifestyleData));
          navigate(`/verify-email?email=${encodeURIComponent(authData.email)}`, { state: { formData, isLogin, step } });
          return;
        }

        // After register, update lifestyle
        await api.put('/matches/lifestyle', lifestyleData, {
          headers: { Authorization: `Bearer ${authData.token}` }
        });

        navigate('/matches');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 animate-fade-in pb-10">
      <div className="glass-panel p-8 space-y-6 relative">
        {!isLogin && step === 2 && (
          <button 
            onClick={handleBack} 
            className="absolute left-6 top-6 text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}

        <div className="text-center space-y-2 pt-2">
          <h2 className="text-3xl font-bold text-primary-900">
            {isLogin ? 'Welcome Back' : (step === 1 ? 'Create Account' : 'Lifestyle Preferences')}
          </h2>
          <p className="text-gray-500">
            {isLogin ? 'Sign in to access your matches.' : (step === 1 ? 'Step 1 of 2: Basic Information' : 'Step 2 of 2: Let\'s find your perfect match')}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={step === 2 || isLogin ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
          
          {(isLogin || step === 1) && (
            <>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <UserIcon size={18} />
                    </div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500" placeholder="John Doe" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required autoComplete={isLogin ? "current-password" : "new-password"}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500" placeholder="••••••••" />
                </div>
              </div>

              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500" placeholder="25" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <select name="occupationStatus" value={formData.occupationStatus} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500">
                      <option value="Student">Student</option>
                      <option value="Working Professional">Working Professional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {!isLogin && step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target City</label>
                  <input type="text" name="targetCity" value={formData.targetCity} onChange={handleChange} required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500" placeholder="Bangalore" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
                  <input type="number" name="maxBudget" value={formData.maxBudget} onChange={handleChange} required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-success-500" placeholder="15000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Roommate Gender</label>
                <select name="preferredGender" value={formData.preferredGender} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="Any">Any</option>
                  <option value="Same Gender Only">Same Gender Only</option>
                </select>
              </div>

              <hr />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Schedule (1: Early, 5: Night Owl)</label>
                <input type="range" name="sleepSchedule" min="1" max="5" value={formData.sleepSchedule} onChange={handleChange} className="w-full accent-success-500" />
                <div className="flex justify-between text-xs text-gray-500"><span>Early Bird</span><span>Night Owl</span></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cleanliness (1: Casual, 5: Neat Freak)</label>
                <input type="range" name="cleanliness" min="1" max="5" value={formData.cleanliness} onChange={handleChange} className="w-full accent-success-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Social Habits (1: Introvert, 5: Extrovert)</label>
                <input type="range" name="socialHabits" min="1" max="5" value={formData.socialHabits} onChange={handleChange} className="w-full accent-success-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
                  <select name="dietaryPref" value={formData.dietaryPref} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Flexible">Flexible</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggitarian">Eggitarian</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" name="smoking" checked={formData.smoking} onChange={handleChange} className="h-4 w-4 text-success-600 focus:ring-success-500 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-900">I Smoke</label>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            {!isLogin && step === 1 ? (
              <button type="button" onClick={handleNext} className="btn-primary w-full py-2.5">
                Next Step
              </button>
            ) : (
              <button type="submit" className="btn-primary w-full py-2.5">
                {isLogin ? 'Sign In' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1);
              setError('');
            }} 
            className="text-sm font-medium text-success-600 hover:text-success-500 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
