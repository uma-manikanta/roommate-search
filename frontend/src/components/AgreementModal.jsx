import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import api from '../api/axios';

const AgreementModal = ({ isOpen, onClose, matchUser }) => {
  const [formData, setFormData] = useState({
    propertyAddress: '',
    rentSplit: '50-50',
    deposit: '2 Months Rent',
    noticePeriod: '30 Days',
    houseRules: 'No smoking. Quiet hours after 10 PM. Clean dishes immediately.'
  });
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      setDownloading(true);
      const response = await api.post('/agreements/generate', {
        tenant2Name: matchUser?.name,
        ...formData
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'roommate-agreement.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      onClose();
    } catch (err) {
      console.error('Failed to download agreement', err);
      alert('Failed to generate agreement.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-5 border-b border-gray-200 bg-primary-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText size={20} /> Generate Agreement
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleExport} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
            <input 
              type="text" 
              name="propertyAddress" 
              value={formData.propertyAddress} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 123 Main St, Apt 4B" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500 focus:border-success-500" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Split Ratio</label>
              <input 
                type="text" 
                name="rentSplit" 
                value={formData.rentSplit} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
              <input 
                type="text" 
                name="deposit" 
                value={formData.deposit} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
            <input 
              type="text" 
              name="noticePeriod" 
              value={formData.noticePeriod} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Rules & Lifestyle</label>
            <textarea 
              name="houseRules" 
              value={formData.houseRules} 
              onChange={handleChange} 
              required 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-success-500 h-24" 
            />
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
              Cancel
            </button>
            <button type="submit" disabled={downloading} className="btn-primary flex items-center gap-2">
              <FileText size={16} /> {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgreementModal;
