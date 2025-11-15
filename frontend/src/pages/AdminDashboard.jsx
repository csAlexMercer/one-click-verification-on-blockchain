import React, { useState, useEffect } from 'react';
import Web3Service from '../services/web3';
import api from '../services/api';
import { getIssuerRegistryContract } from '../services/contracts';

const account = '0x31CcD39D841f15462015982A366D00deA1c2Ec99'.toLowerCase();

const AdminDashboard = ({ showToast }) => {
  const [stats, setStats] = useState({ 
    total_issuers: 0, 
    active_issuers: 0, 
    total_certificates: 0 
  });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const statsRes = await api.getStats();
      if (statsRes.success) setStats(statsRes.data);
      
      // Fetch pending registrations
      try {
        const pendingRes = await api.getPendingRegistrations();
        if (pendingRes.success) setPending(pendingRes.data || []);
      } catch (err) {
        // Endpoint not implemented yet
        setPending([]);
      }
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async (institution) => {
    try {
      await Web3Service.connectWallet();
      const contract = getIssuerRegistryContract();
      await contract.methods.registerIssuer(
        institution.address, 
        institution.name, 
        institution.location
      ).send({from: account});
      
      showToast('Institution approved!', 'success');
      fetchData();
    } catch (err) {
      showToast('Approval failed: ' + err.message, 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{minHeight: '95vh'}}>
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="px-8 py-8">
      <h1 className="text-white text-4xl font-bold text-center mb-8">
        Admin Dashboard
      </h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-gray-600 text-lg mb-2">Total Issuers</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.total_issuers}</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-gray-600 text-lg mb-2">Active Issuers</h3>
          <p className="text-4xl font-bold text-green-600">{stats.active_issuers}</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-gray-600 text-lg mb-2">Certificates Issued</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.total_certificates}</p>
        </div>
      </div>
      
      {/* Pending Requests */}
      <div className="bg-white bg-opacity-90 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Pending Institution Requests</h2>
        
        {pending.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {pending.map((inst, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded">
                <div>
                  <h3 className="font-bold text-lg">{inst.name}</h3>
                  <p className="text-gray-600">{inst.location}</p>
                  <p className="text-sm text-gray-500">{inst.address}</p>
                  <p className="text-sm text-gray-500">{inst.email}</p>
                </div>
                <button 
                  onClick={() => handleAccept(inst)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;