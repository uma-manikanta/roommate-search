import React, { useState } from 'react';
import { Calculator, FileText, X } from 'lucide-react';
import api from '../api/axios';

const ExpenseCalculator = ({ listing, onClose }) => {
  const [wifi, setWifi] = useState(1000);
  const [maid, setMaid] = useState(2500);
  const [electricity, setElectricity] = useState(1500);
  const [downloading, setDownloading] = useState(false);

  // Per head calculation
  const roommates = listing.roomType === 'Shared Room' ? 2 : 1;
  const rentPerHead = listing.rentPerHead;
  const depositPerHead = listing.depositPerHead;
  const utilitiesPerHead = Math.round((wifi + maid + electricity) / (roommates > 1 ? 2 : 1)); // simplifying logic for shared flats

  const totalMonthly = rentPerHead + utilitiesPerHead;

  const handleExportAgreement = async () => {
    try {
      setDownloading(true);
      const response = await api.post('/agreements/generate', {
        tenant2Name: listing.hostId?.name || 'Host',
        propertyAddress: `${listing.locality}, ${listing.city}`,
        rentSplit: rentPerHead.toString(),
        deposit: depositPerHead.toString()
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'draft-agreement.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download agreement', err);
      alert('Failed to generate agreement.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-4 bg-primary-900 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calculator size={18} />
            Cost Estimator
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">Listing: {listing.title}</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Base Rent (Per Head)</span>
              <span className="font-bold text-gray-900">₹{rentPerHead.toLocaleString()}</span>
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Adjust Estimated Utilities (Total for Flat)</label>
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700 w-24">Wi-Fi</span>
                <input type="range" min="500" max="3000" step="100" value={wifi} onChange={(e) => setWifi(Number(e.target.value))} className="flex-1" />
                <span className="text-sm font-medium w-16 text-right">₹{wifi}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700 w-24">Maid/Cook</span>
                <input type="range" min="1000" max="8000" step="500" value={maid} onChange={(e) => setMaid(Number(e.target.value))} className="flex-1" />
                <span className="text-sm font-medium w-16 text-right">₹{maid}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700 w-24">Electricity</span>
                <input type="range" min="500" max="5000" step="100" value={electricity} onChange={(e) => setElectricity(Number(e.target.value))} className="flex-1" />
                <span className="text-sm font-medium w-16 text-right">₹{electricity}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Your Share of Utilities</span>
                <span className="font-medium">₹{utilitiesPerHead.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-primary-900 border-t border-gray-200 pt-2 mt-2">
                <span>Total Est. Monthly</span>
                <span>₹{totalMonthly.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">* Security Deposit: ₹{depositPerHead.toLocaleString()}</p>
          </div>

          <button 
            onClick={handleExportAgreement}
            disabled={downloading}
            className="btn-outline w-full flex items-center justify-center gap-2"
          >
            <FileText size={18} /> {downloading ? 'Generating...' : 'Draft Joint Agreement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCalculator;
