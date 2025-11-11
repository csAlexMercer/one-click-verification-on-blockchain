import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MetaMaskConnect from '../components/MetaMaskConnect';
import { registerIssuer } from '../services/contracts';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
    });

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!connectedAccount) {
        toast.error('Please connect your wallet first');
        return;
        }

        if (!formData.name || !formData.location) {
        toast.error('Please fill in all fields');
        return;
        }

        setLoading(true);
        try {
        
        await registerIssuer(
            connectedAccount, // Using connected wallet as issuer address
            formData.name,
            formData.location,
            connectedAccount // Admin's address (must be contract owner)
        );

        toast.success('Institution registered successfully!');

        setFormData({ name: '', location: '' });

        setTimeout(() => {
            navigate('/admin/dashboard');
        }, 2000);

        } catch (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('caller is not the owner')) {
            toast.error('Only contract owner can register institutions');
        } else if (error.message.includes('already registered')) {
            toast.error('This address is already registered');
        } else {
            toast.error(error.message || 'Failed to register institution');
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
        <div className="card">
            <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Register New Institution
            </h2>
            <p className="text-gray-600">
                Register a new educational institution to issue certificates
            </p>
            </div>

            {/* MetaMask Connection */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                <p className="font-medium text-gray-900">Wallet Connection</p>
                <p className="text-sm text-gray-600 mt-1">
                    {connectedAccount 
                    ? 'Wallet connected - Institution will use this address' 
                    : 'Connect MetaMask to register institution'}
                </p>
                </div>
                <MetaMaskConnect onConnect={setConnectedAccount} />
            </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="label">Institution Name</label>
                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., University of Example"
                className="input-field"
                required
                />
                <p className="text-xs text-gray-500 mt-1">
                Enter the full legal name of the institution
                </p>
            </div>

            <div>
                <label className="label">Location</label>
                <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, USA"
                className="input-field"
                required
                />
                <p className="text-xs text-gray-500 mt-1">
                Enter the city and country where the institution is located
                </p>
            </div>

            {connectedAccount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                    Institution Wallet Address:
                </p>
                <p className="text-sm font-mono text-gray-900 break-all">
                    {connectedAccount}
                </p>
                </div>
            )}

            <div className="flex space-x-4">
                <button
                type="submit"
                disabled={loading || !connectedAccount}
                className="btn btn-primary flex-1"
                >
                {loading ? 'Registering...' : 'Register Institution'}
                </button>
                
                <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="btn btn-secondary"
                >
                Cancel
                </button>
            </div>
            </form>

            {/* Information Box */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only the contract owner can register new institutions. 
                The connected wallet address will be registered as the institution's wallet.
            </p>
            </div>
        </div>
        </div>
    );
};

export default AdminRegister;