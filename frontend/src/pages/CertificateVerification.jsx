import React, { useState } from 'react';
import api from '../services/api';

const VerifyPage = ({ showToast }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };
  
  const handleVerify = async () => {
    if (!file) {
      showToast('Please select a certificate', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const verifyResult = await api.verifyByFile(file);
      setResult(verifyResult);
      
      if (verifyResult.success && verifyResult.data.is_valid) {
        showToast('Verification successful!', 'success');
      } else {
        showToast('Verification failed', 'error');
      }
    } catch (err) {
      showToast('Verification error: ' + err.message, 'error');
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center px-8" style={{minHeight: '95vh', paddingTop: '5vh'}}>
      <div className="w-full min-h-10xl max-w-6xl bg-black bg-opacity-70 rounded-lg p-8">
        <h1 className="text-white text-3xl font-bold text-center mb-8">
          Verification Tool
        </h1>
        
        <div className="flex gap-6">
          {/* Left: Upload and Verify */}
          <div className="flex-[7] space-y-6">
            <div className="flex gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="flex-1 px-4 py-3 rounded bg-white"
              />
              <button 
                onClick={handleVerify}
                disabled={loading}
                className="bg-black hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            
            {/* Result */}
            {result && (
              <div className={`p-6 rounded-lg ${
                result.success && result.data?.is_valid 
                  ? 'bg-green-100 border-2 border-green-500' 
                  : 'bg-red-100 border-2 border-red-500'
              }`}>
                {result.success && result.data?.is_valid ? (
                  <>
                    <h2 className="text-2xl font-bold text-green-800 mb-4">
                      ✅ Verification Successful!
                    </h2>
                    <div className="space-y-2 text-green-900">
                      <p><strong>Issued By:</strong> {result.data.issuer_name}</p>
                      <p><strong>Issued To:</strong> {result.data.recipient}</p>
                      <p><strong>Issued At:</strong> {new Date(result.data.issuance_time * 1000).toLocaleString()}</p>
                      <p><strong>Status:</strong> {result.data.status}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                      ❌ Verification Failed
                    </h2>
                    <p className="text-red-900 mb-2">
                      Certificate not found on the chain.
                    </p>
                    <p className="text-red-900 font-semibold">
                      Possible causes:
                    </p>
                    <ul className="list-disc list-inside text-red-900">
                      <li>Certificate was never issued</li>
                      <li>Certificate has been tampered with</li>
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Right: PDF Preview */}
          <div className="flex-[3]">
            {previewUrl ? (
              <div className="bg-white rounded-lg p-4 h-full">
                <h3 className="font-bold mb-2">Certificate Preview</h3>
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border rounded"
                  title="Certificate Preview"
                />
              </div>
            ) : (
              <div className="bg-white bg-opacity-50 rounded-lg p-8 h-full flex items-center justify-center text-center">
                <p className="text-gray-600">Certificate preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;