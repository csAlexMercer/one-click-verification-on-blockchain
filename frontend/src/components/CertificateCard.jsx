import React, { useState } from 'react';

const CertificateCard = ({ certificate }) => {
    const { hash, issuer_name, issuance_time, is_revoked } = certificate;
    const [expanded, setExpanded] = useState(false);
    
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
            is_revoked 
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-white hover:shadow-lg'
        }`}>
            {/* Card Header */}
            <div className={`px-6 py-4 ${
                is_revoked 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{is_revoked ? '❌' : '🎓'}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">
                                {issuer_name || 'Unknown Issuer'}
                            </h3>
                            <p className="text-xs text-white/80">
                                {formatDate(issuance_time)}
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        is_revoked 
                            ? 'bg-red-800 text-red-100' 
                            : 'bg-green-800 text-green-100'
                    }`}>
                        {is_revoked ? 'REVOKED' : 'ACTIVE'}
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
                <div className="space-y-4">
                    {/* Certificate Hash */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">
                            Certificate Hash
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className={`text-xs font-mono break-all ${
                                expanded ? '' : 'truncate'
                            }`}>
                                {hash}
                            </p>
                        </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                        {expanded ? '▲ Show Less' : '▼ Show More'}
                    </button>

                    {/* Expanded Details */}
                    {expanded && (
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                    Status
                                </label>
                                <p className={`text-sm font-semibold ${
                                    is_revoked ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {is_revoked 
                                        ? '❌ This certificate has been revoked and is no longer valid' 
                                        : '✓ This certificate is valid and active'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                    Issued By
                                </label>
                                <p className="text-sm text-gray-900 font-medium">
                                    {issuer_name || 'Unknown Institution'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                    Issue Date
                                </label>
                                <p className="text-sm text-gray-900">
                                    {formatDate(issuance_time)}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(hash);
                                        alert('Hash copied to clipboard!');
                                    }}
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    📋 Copy Hash
                                </button>
                                <button
                                    onClick={() => {
                                        // Navigate to verification page with hash
                                        window.location.href = `/verify?hash=${encodeURIComponent(hash)}`;
                                    }}
                                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    ✓ Verify
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            {is_revoked && (
                <div className="px-6 py-3 bg-red-100 border-t border-red-200">
                    <p className="text-xs text-red-800">
                        <strong>⚠️ Warning:</strong> This certificate is no longer valid and should not be trusted.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CertificateCard;