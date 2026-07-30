import React, { useEffect, useState, useContext } from 'react';
import { MapPin, IndianRupee, Plus, X } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ExpenseCalculator from '../components/ExpenseCalculator';

const Listings = () => {
  const { user, femaleShield } = useContext(AuthContext);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Post Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', city: '', locality: '', rentPerHead: '', depositPerHead: '', roomType: 'Shared Room'
  });

  useEffect(() => {
    fetchListings();
  }, [femaleShield, user]);

  const fetchListings = async () => {
    try {
      let url = '/listings';
      const params = new URLSearchParams();
      if (femaleShield && user?.gender) {
        params.append('femaleShield', 'true');
        params.append('userGender', user.gender);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const { data } = await api.get(url);
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostListing = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      await api.post('/listings', {
        ...formData,
        rentPerHead: Number(formData.rentPerHead),
        depositPerHead: Number(formData.depositPerHead)
      });
      setShowModal(false);
      setFormData({ title: '', description: '', city: '', locality: '', rentPerHead: '', depositPerHead: '', roomType: 'Shared Room' });
      fetchListings(); // Refresh listings
    } catch (err) {
      console.error(err);
      alert('Failed to post listing');
    }
  };

  if (loading) return <div className="text-center py-10">Loading listings...</div>;

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Available Listings</h1>
          <p className="text-gray-600 mt-2">Find verified apartments and rooms matching your budget.</p>
        </div>
        <button onClick={() => user ? setShowModal(true) : navigate('/auth')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Post a Flat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <div key={listing._id} className="glass-panel overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-48 bg-gray-200 relative overflow-hidden flex-shrink-0">
              {/* Image placeholder */}
              <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-colors duration-300"></div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-900 shadow-sm">
                {listing.roomType}
              </div>
            </div>
            <div className="p-5 space-y-3 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-primary-900 line-clamp-1">{listing.title}</h3>
              
              <div className="flex items-center text-sm text-gray-500 gap-1">
                <MapPin size={16} />
                <span>{listing.locality}, {listing.city}</span>
              </div>
              
              <div className="flex-1 text-sm text-gray-600 line-clamp-2">
                {listing.description}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Rent Per Head</span>
                  <div className="flex items-center font-bold text-primary-900 text-lg">
                    <IndianRupee size={16} className="mr-0.5" />
                    {listing.rentPerHead.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500 ml-1">/mo</span>
                  </div>
                </div>
                <button onClick={() => setSelectedListing(listing)} className="text-success-600 text-sm font-semibold hover:text-success-500 flex items-center gap-1">
                  Cost Calculator &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {listings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No listings available right now. Be the first to post one!
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-primary-900">Post a Listing</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handlePostListing} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500 focus:border-success-500" placeholder="e.g. Spacious 2BHK in Indiranagar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500 focus:border-success-500" rows="3"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                  <input type="text" value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent per Head (₹)</label>
                  <input type="number" value={formData.rentPerHead} onChange={e => setFormData({...formData, rentPerHead: e.target.value})} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit per Head (₹)</label>
                  <input type="number" value={formData.depositPerHead} onChange={e => setFormData({...formData, depositPerHead: e.target.value})} required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select value={formData.roomType} onChange={e => setFormData({...formData, roomType: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500">
                  <option value="Single Private">Single Private</option>
                  <option value="Shared Room">Shared Room</option>
                  <option value="Full Flat">Full Flat</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="btn-success">Post Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedListing && (
        <ExpenseCalculator listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}
    </div>
  );
};

export default Listings;
