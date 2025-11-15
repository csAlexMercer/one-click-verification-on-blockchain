import React, { useState } from 'react';
import Web3Service from '../services/web3';
import api from '../services/api';

const RegisterPage = ({ showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleConnect = async () => {
    try {
      const acc = await Web3Service.connectWallet();
      setFormData(prev => ({ ...prev, address: acc }));
      showToast('Wallet connected!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.address || !formData.email) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.registerInstitution({
        issuer_address: formData.address,
        name: formData.name,
        location: formData.location,
        email: formData.email
      });
      
      if (result.success) {
        showToast('Registration request submitted! Awaiting admin approval.', 'success');
        setFormData({ name: '', location: '', address: '', email: '' });
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Registration failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center h-650 justify-center" style={{minHeight: '95vh', padding: '5vh'}}>
      <div className="w-full max-w-4xl h-600 bg-black bg-opacity-70 rounded-lg p-8">
        <h1 className="text-white text-3xl font-bold text-center mb-10">
          Institution Registration
        </h1>
        
        <div className="flex gap-8">
          {/* Left: Form Fields */}
          <div className="flex-1 space-y-12">
            <input
              type="text"
              placeholder="Institution Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded bg-white bg-opacity-90 text-black"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-3 rounded bg-white bg-opacity-90 text-black"
            />
            <input
              type="text"
              placeholder="Blockchain Account Address"
              value={formData.address}
              readOnly
              className="w-full px-4 py-3 rounded bg-gray-200 text-black"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded bg-white bg-opacity-90 text-black"
            />
          </div>
          
          {/* Right: Buttons */}
          <div className="flex flex-col gap-20 justify-center">
            <button 
              onClick={handleConnect}
              className="bg-black hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition whitespace-nowrap"
            >
              Connect Wallet
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;