import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Building, UserCircle2, Shield, CheckCircle, ChevronDown, User, LogOut, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import VerificationModal from './VerificationModal';
import api from '../api/axios';
import { io } from 'socket.io-client';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setFemaleShield, femaleShield } = useContext(AuthContext);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track unread counts
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/chat/unread/count');
        setUnreadCount(data.count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadCount();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.emit('join_room', user._id);

    socket.on('update_chat_list', () => {
      fetchUnreadCount();
    });

    // Also poll every 10 seconds just in case it was read on another device
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [user, location.pathname]); // re-fetch when location changes (e.g., leaving Chats page)
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Matches', path: '/matches', icon: <Users size={18} /> },
    { name: 'Listings', path: '/listings', icon: <Building size={18} /> },
    { name: 'Chats', path: '/chats', icon: <MessageCircle size={18} />, badge: unreadCount > 0 ? unreadCount : null }
  ];

  return (
    <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {/* Logo placeholder */}
            <div className="w-8 h-8 rounded-md bg-primary-900 text-white flex items-center justify-center font-bold text-xl">
              R
            </div>
            <Link to="/" className="font-bold text-xl text-primary-900 hidden sm:block tracking-tight">
              RoommateMatcher
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 relative ${
                  location.pathname === link.path 
                    ? 'text-success-500' 
                    : 'text-gray-600 hover:text-primary-900'
                }`}
              >
                {link.icon}
                {link.name}
                {link.badge && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.gender === 'Female' && (
                  <div className="hidden lg:flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                    <Shield size={16} className={femaleShield ? 'text-pink-600' : 'text-gray-400'} />
                    <label className="text-xs font-medium text-pink-900 cursor-pointer flex items-center gap-2">
                      Female Shield
                      <input 
                        type="checkbox" 
                        checked={femaleShield} 
                        onChange={(e) => setFemaleShield(e.target.checked)}
                        className="toggle-checkbox"
                      />
                    </label>
                  </div>
                )}
                
                {(!user.verificationBadges || user.verificationBadges.length === 0) && (
                  <button 
                    onClick={() => setShowVerifyModal(true)}
                    className="flex items-center gap-1 text-xs font-bold text-success-600 bg-success-50 px-2 py-1 rounded hover:bg-success-100"
                  >
                    <CheckCircle size={14} /> Verify Profile
                  </button>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-full py-1 pl-1 pr-3 transition-colors border border-transparent hover:border-gray-200"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user.name}
                    </span>
                    <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-scale-in">
                      <button 
                        onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User size={16} className="text-gray-400" /> My Profile
                      </button>
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          window.location.href = '/';
                        }} 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} className="text-red-400" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/auth" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-900 transition-colors">
                  <UserCircle2 size={20} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link to="/auth" className="btn-primary hidden sm:block">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <VerificationModal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-[60] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full py-1 relative transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                {link.icon}
                {link.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-white">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{link.name}</span>
            </Link>
          );
        })}
        {/* Profile Link for mobile */}
        {user ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
              location.pathname === '/profile' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <User size={18} />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        ) : (
          <Link
            to="/auth"
            className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
              location.pathname === '/auth' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <UserCircle2 size={18} />
            <span className="text-[10px] mt-1 font-medium">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
