import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getActiveIssuers } from '../services/api';
import { formatAddress } from '../services/web3';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_issuers: 0,
    active_issuers: 0,
    total_certificates: 0,
    total_revoked: 0,
  });
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsResponse = await getStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch active issuers
      const issuersResponse = await getActiveIssuers();
      if (issuersResponse.success) {
        setIssuers(issuersResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of the certificate verification platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-blue-100 text-sm font-medium">
              Total Institutions
            </div>
            <div className="text-4xl">🏛️</div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.total_issuers}</div>
          <div className="text-blue-100 text-sm">Registered on platform</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-green-100 text-sm font-medium">
              Active Institutions
            </div>
            <div className="text-4xl">✅</div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.active_issuers}</div>
          <div className="text-green-100 text-sm">Currently active</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-purple-100 text-sm font-medium">
              Total Certificates
            </div>
            <div className="text-4xl">📜</div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.total_certificates}</div>
          <div className="text-purple-100 text-sm">Issued on blockchain</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-red-100 text-sm font-medium">
              Revoked Certificates
            </div>
            <div className="text-4xl">❌</div>
          </div>
          <div className="text-4xl font-bold mb-1">{stats.total_revoked}</div>
          <div className="text-red-100 text-sm">No longer valid</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/register"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <span className="mr-2">➕</span>
            Register New Institution
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-6 py-3 bg-secondary text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            <span className="mr-2">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Registered Institutions ({issuers.length})
          </h2>
        </div>

        {issuers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Institutions Registered Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by registering your first institution
            </p>
            <Link
              to="/admin/register"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Register First Institution
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuers.map((issuer, index) => (
                  <tr key={issuer.address} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {issuer.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600">
                        {formatAddress(issuer.address)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {issuer.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="text-3xl mr-4">ℹ️</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About This Platform</h3>
            <p className="text-blue-800 text-sm">
              This blockchain-based certificate verification system ensures tamper-proof 
              digital certificates. All certificates are permanently recorded on the 
              blockchain and can be instantly verified by anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;