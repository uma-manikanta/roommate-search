import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Building, UserCircle2, Shield, CheckCircle, ChevronDown, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import VerificationModal from './VerificationModal';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, setFemaleShield, femaleShield } = useContext(AuthContext);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Matches', path: '/matches', icon: <Users size={18} /> },
    { name: 'Listings', path: '/listings', icon: <Building size={18} /> }
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
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path 
                    ? 'text-success-500' 
                    : 'text-gray-600 hover:text-primary-900'
                }`}
              >
                {link.icon}
                {link.name}
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
    </header>
  );
};

export default Navbar;
