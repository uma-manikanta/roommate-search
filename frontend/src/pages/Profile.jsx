import React, { useState, useContext, useEffect } from 'react';
import { UserCircle, Settings, Target, MapPin, IndianRupee, ShieldCheck, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const { showAlert } = useDialog();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
    preferredGender: 'Any',
    hideProfileFromMales: false
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
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      showAlert('Failed to update profile.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12 relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Changes Saved!</h3>
            <p className="text-gray-500 text-sm">Your preferences and lifestyle details have been updated.</p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowSuccessModal(false)} 
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                OK
              </button>
              <button 
                onClick={() => navigate('/matches')} 
                className="flex-1 py-2 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium transition-colors shadow-sm shadow-primary-500/30"
              >
                View Matches
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Female Safety Shield Toggle (Only visible for females) */}
            {user.gender === 'Female' && (
              <div className="col-span-1 md:col-span-3 bg-pink-50/50 p-4 rounded-xl border border-pink-100 flex items-center justify-between shadow-sm mt-2">
                <div>
                  <h3 className="text-sm font-bold text-pink-900 flex items-center gap-1">
                    <ShieldCheck size={16} className="text-pink-600" /> Female Safety Shield
                  </h3>
                  <p className="text-xs text-pink-700 mt-1">Hide your profile completely from male users across the platform.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={preferences.hideProfileFromMales || false}
                    onChange={async (e) => {
                      const isChecked = e.target.checked;
                      setPreferences({...preferences, hideProfileFromMales: isChecked});
                      try {
                        const updatedPreferences = { ...(user.preferences || {}), hideProfileFromMales: isChecked };
                        const { data } = await api.put('/matches/lifestyle', { preferences: updatedPreferences });
                        const updatedUser = { ...user, preferences: data.preferences };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                      } catch (err) {
                        console.error('Failed to toggle Female Shield', err);
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            )}
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
