import React, { useContext } from 'react';
import { ShieldCheck, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-slide-up">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-primary-900 sm:text-6xl">
          Find Your <span className="text-success-500">Verified</span> Roommate
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          The only platform combining deterministic lifestyle matching with strict e-KYC and professional verification. No fake profiles. No spam. Just verified people looking for shared housing.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          {user ? (
            <Link to="/matches" className="btn-primary text-lg px-8 py-3">
              View Matches
            </Link>
          ) : (
            <Link to="/auth" className="btn-primary text-lg px-8 py-3">
              Join Now
            </Link>
          )}
          <Link to="/listings" className="btn-outline text-lg px-8 py-3">
            Browse Listings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-16">
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-success-100 text-success-600 rounded-full flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-semibold text-primary-900">100% Verified</h3>
          <p className="text-gray-600">Every user is verified via Student/Work email or Government e-KYC before messaging.</p>
        </div>
        
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-semibold text-primary-900">Lifestyle Matching</h3>
          <p className="text-gray-600">Our deterministic algorithm matches you based on sleep schedule, cleanliness, and diet.</p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <Search size={24} />
          </div>
          <h3 className="text-xl font-semibold text-primary-900">Safe Searching</h3>
          <p className="text-gray-600">Strict anti-dating guardrails and masked contact details until mutual move-in intent.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
