import React from 'react';

const CertificateCard = ({ certificate }) => {
    const { hash, issuerName, issuanceTime, isRevoked } = certificate;
    
    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="card hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div>
            <h3 className="font-semibold text-lg">{issuerName || 'Unknown Issuer'}</h3>
            <p className="text-sm text-gray-500">{formatDate(issuanceTime)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isRevoked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
            {isRevoked ? 'Revoked' : 'Active'}
            </span>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Certificate Hash:</p>
            <p className="text-xs font-mono break-all">{hash}</p>
        </div>
        </div>
    );
};

export default CertificateCard;