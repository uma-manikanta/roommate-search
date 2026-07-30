import React, { useEffect, useState, useContext } from 'react';
import { ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LifestyleRadar from '../components/LifestyleRadar';
import { useNavigate } from 'react-router-dom';

const Matches = () => {
  const { user, femaleShield } = useContext(AuthContext);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchMatches = async () => {
      try {
        const { data } = await api.get(`/matches?femaleShield=${femaleShield || false}`);
        setMatches(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [user, navigate, femaleShield]);

  const openChat = (matchUser) => {
    navigate(`/chats?user=${matchUser._id}&name=${encodeURIComponent(matchUser.name)}`);
  };

  if (loading) return <div className="text-center py-10">Loading matches...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Your Top Matches</h1>
          <p className="text-gray-600 mt-2">Based on your lifestyle preferences and target city.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="btn-outline hidden sm:block">Edit Preferences</button>
      </div>

      {matches.length === 0 ? (
        <div className="glass-panel p-10 text-center text-gray-500">
          No matches found in your area yet. Try expanding your search or adjusting your preferences!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    {item.user.name}
                    {item.user.isIdentityVerified && <ShieldCheck size={18} className="text-success-500" title="Identity Verified" />}
                  </h3>
                  <p className="text-sm text-gray-500">{item.user.age} • {item.user.occupationStatus}</p>
                  
                  {item.user.isEmailVerified && (
                    <div className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                      {item.user.verificationType}
                    </div>
                  )}
                </div>
                <div className={`font-bold px-3 py-1 rounded-full text-sm ${item.compatibility > 75 ? 'bg-success-50 text-success-600' : 'bg-orange-50 text-orange-600'}`}>
                  {item.compatibility}% Match
                </div>
              </div>

              {/* Show penalty tag if match < 80 just as an example visual */}
              {item.compatibility < 80 && (
                <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                  <AlertCircle size={12} /> Dietary/Lifestyle Differences
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <LifestyleRadar currentUser={user} matchUser={item.user} />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button className="btn-outline flex-1 py-2 text-sm">View Profile</button>
                <button onClick={() => openChat(item.user)} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2">
                  <MessageCircle size={16} /> Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
