import React, { useState } from 'react';
import api from '../services/api';

const IssuePage = ({ account, showToast }) => {
  const [file, setFile] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [revokeFile, setRevokeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleIssue = async () => {
    if (!file || !recipient) {
      showToast('Please provide certificate file and recipient address', 'error');
      return;
    }
    
    if (!account) {
      showToast('Please connect your wallet', 'error');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      // Calculate hash
      const hashRes = await api.calculateHash(file);
      if (!hashRes.success) throw new Error('Hash calculation failed');
      
      const hash = hashRes.data.hash;
      
      // TODO: Issue certificate via smart contract
      // const contract = getCertificateStoreContract();
      // await contract.methods.issueCertificate(hash, recipient).send({from: account});
      
      showToast('Certificate issued successfully!', 'success');
      setMessage('✅ Certificate issued successfully on blockchain!');
      setFile(null);
      setRecipient('');
    } catch (err) {
      showToast('Issuance failed: ' + err.message, 'error');
      setMessage('❌ Certificate issuance failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevoke = async () => {
    if (!revokeFile) {
      showToast('Please select a certificate to revoke', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const hashRes = await api.calculateHash(revokeFile);
      if (!hashRes.success) throw new Error('Hash calculation failed');
      
      // TODO: Revoke via smart contract
      // const contract = getCertificateStoreContract();
      // await contract.methods.revokeCertificate(hash).send({from: account});
      
      showToast('Certificate revoked successfully!', 'success');
      setRevokeFile(null);
    } catch (err) {
      showToast('Revocation failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center px-8" style={{minHeight: '95vh', paddingTop: '5vh'}}>
      <div className="w-full max-w-4xl bg-black bg-opacity-70 rounded-lg p-8">
        <h1 className="text-white text-3xl font-bold text-center mb-8">
          Issue Certificate
        </h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        
        {/* Issue Section */}
        <div className="mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-white block mb-2">Select Certificate File (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-3 rounded bg-white"
                />
              </div>
              <div>
                <label className="text-white block mb-2">Enter Recipient's Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded bg-white"
                />
              </div>
            </div>
            <button 
              onClick={handleIssue}
              disabled={loading}
              className="bg-black hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold h-fit disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Issue'}
            </button>
          </div>
        </div>
        
        {/* Revoke Section */}
        <div className="border-t border-gray-500 pt-8">
          <h2 className="text-white text-2xl font-bold mb-4">Revoke Certificate</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-white block mb-2">Upload Certificate to Revoke</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setRevokeFile(e.target.files[0])}
                className="w-full px-4 py-3 rounded bg-white"
              />
            </div>
            <button 
              onClick={handleRevoke}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold h-fit disabled:opacity-50"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuePage;