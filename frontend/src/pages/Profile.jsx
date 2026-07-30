import React, { useState, useContext, useEffect } from 'react';
import { UserCircle, Settings, Target, MapPin, IndianRupee, ShieldCheck, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Local state for edits
  const [lifestyle, setLifestyle] = useState({
    sleepSchedule: 3,
    cleanliness: 3,
    socialHabits: 3,
    dietaryPref: 'Flexible',
    smoking: false
  });
  
  const [preferences, setPreferences] = useState({
    targetCity: 'Bangalore',
    maxBudget: 15000,
    preferredGender: 'Any'
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.lifestyle) setLifestyle(user.lifestyle);
    if (user.preferences) setPreferences(user.preferences);
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/matches/lifestyle', { lifestyle, preferences });
      const updatedUser = { ...user, lifestyle: data.lifestyle, preferences: data.preferences };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully! New matches will be generated.');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        {user.avatar ? (
          <img src={user.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center text-2xl font-bold shadow-sm">
            {user.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-3xl font-bold text-primary-900">{user.name}</h1>
            {user.verificationBadges && user.verificationBadges.map(badge => (
              <span key={badge} className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 border border-green-200 shadow-sm mt-1">
                <CheckCircle size={14} /> {badge}
              </span>
            ))}
          </div>
          <p className="text-gray-600 mt-1">{user.email} • {user.occupationStatus}</p>
        </div>
      </div>

      {/* VERIFIED CREDENTIALS */}
      {user.verifiedDetails && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none">
            <ShieldCheck size={140} className="text-green-600" />
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-green-900 flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-green-600" /> Official KYC Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Legal Name</p>
                <p className="text-sm font-medium text-gray-900">{user.verifiedDetails.name}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900">{user.verifiedDetails.dob}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-medium text-gray-900">{user.verifiedDetails.gender}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Provider</p>
                <p className="text-sm font-medium text-gray-900">{user.verifiedDetails.kycProvider}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Registered Address</p>
                <p className="text-sm font-medium text-gray-900">{user.verifiedDetails.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* MATCH PREFERENCES */}
        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-2">
            <Target size={20} /> Roommate & Flat Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={16} /> Target City
              </label>
              <select 
                value={preferences.targetCity} 
                onChange={(e) => setPreferences({...preferences, targetCity: e.target.value})}
                className="input-field"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <IndianRupee size={16} /> Max Budget (Per Month)
              </label>
              <input 
                type="number" 
                value={preferences.maxBudget}
                onChange={(e) => setPreferences({...preferences, maxBudget: Number(e.target.value)})}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <UserCircle size={16} /> Preferred Gender
              </label>
              <select 
                value={preferences.preferredGender} 
                onChange={(e) => setPreferences({...preferences, preferredGender: e.target.value})}
                className="input-field"
              >
                <option value="Same Gender Only">Same Gender Only</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>
        </div>

        {/* LIFESTYLE VECTORS */}
        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold text-primary-900 mb-6 flex items-center gap-2">
            <Settings size={20} /> Lifestyle Vectors
          </h2>
          <div className="space-y-6 max-w-2xl">
            
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Sleep Schedule</span>
                <span className="text-primary-600">{lifestyle.sleepSchedule === 1 ? 'Early Bird' : lifestyle.sleepSchedule === 5 ? 'Night Owl' : 'Balanced'}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1" 
                value={lifestyle.sleepSchedule} 
                onChange={(e) => setLifestyle({...lifestyle, sleepSchedule: Number(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Early Bird</span>
                <span>Night Owl</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Cleanliness</span>
                <span className="text-primary-600">{lifestyle.cleanliness === 1 ? 'Messy' : lifestyle.cleanliness === 5 ? 'Neat Freak' : 'Average'}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1" 
                value={lifestyle.cleanliness} 
                onChange={(e) => setLifestyle({...lifestyle, cleanliness: Number(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Messy</span>
                <span>Neat Freak</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Social Habits</span>
                <span className="text-primary-600">{lifestyle.socialHabits === 1 ? 'Keep to Myself' : lifestyle.socialHabits === 5 ? 'Bring Friends Over' : 'Moderate'}</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1" 
                value={lifestyle.socialHabits} 
                onChange={(e) => setLifestyle({...lifestyle, socialHabits: Number(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Keep to Myself</span>
                <span>Very Social</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
                <select 
                  value={lifestyle.dietaryPref} 
                  onChange={(e) => setLifestyle({...lifestyle, dietaryPref: e.target.value})}
                  className="input-field"
                >
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Eggitarian">Eggitarian</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Smoking</label>
                <select 
                  value={lifestyle.smoking} 
                  onChange={(e) => setLifestyle({...lifestyle, smoking: e.target.value === 'true'})}
                  className="input-field"
                >
                  <option value="false">Non-Smoker</option>
                  <option value="true">Smoker</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
