import React, { useState } from 'react';
import Web3Service from '../services/web3';
import api from '../services/api';

const HolderDashboard = ({ showToast }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const account = await Web3Service.connectWallet();
      const result = await api.getRecipientCertificates(account);
      
      if (result.success) {
        setCertificates(result.data.certificates || []);
        setFetched(true);
        showToast('Certificates loaded!', 'success');
      } else {
        showToast('Failed to fetch certificates', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center px-8" style={{minHeight: '95vh', paddingTop: '5vh'}}>
      <div className="w-full max-w-4xl bg-black bg-opacity-70 rounded-lg p-8">
        <h1 className="text-white text-3xl font-bold text-center mb-8">
          Certificate Holder Dashboard
        </h1>
        
        {!fetched ? (
          <div className="text-center">
            <button 
              onClick={fetchCertificates}
              disabled={loading}
              className="bg-black hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:opacity-50"
              style={{width: '25%', minWidth: '400px'}}
            >
              {loading ? 'Loading...' : 'Fetch My Certificates'}
            </button>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Fetching certificates...</p>
              </div>
            ) : certificates.length === 0 ? (
              <p className="text-white text-center text-xl">No certificates found</p>
            ) : (
              <div className="space-y-4">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{cert.issuer_name || 'Unknown Issuer'}</h3>
                        <p className="text-gray-600">
                          Issued: {new Date(cert.issuance_time * 1000).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        cert.is_revoked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {cert.is_revoked ? 'Revoked' : 'Active'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Certificate Hash:</p>
                      <p className="text-sm font-mono break-all">{cert.hash}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolderDashboard;