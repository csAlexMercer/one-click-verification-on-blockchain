import React, { useState, useEffect } from 'react';
import { connectWallet, getCurrentAccount, formatAddress, onAccountsChanged } from '../services/web3';
import toast from 'react-hot-toast';

const MetaMaskConnect = ({ onConnect }) => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkConnection();

        onAccountsChanged((newAccount) => {
        setAccount(newAccount);
        if (onConnect) onConnect(newAccount);
        });
    }, []);

    const checkConnection = async () => {
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
        setAccount(currentAccount);
        if (onConnect) onConnect(currentAccount);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
        const connectedAccount = await connectWallet();
        setAccount(connectedAccount);
        if (onConnect) onConnect(connectedAccount);
        toast.success('Wallet connected successfully!');
        } catch (error) {
        toast.error(error.message || 'Failed to connect wallet');
        } finally {
        setLoading(false);
        }
    };

    if (account) {
        return (
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">{formatAddress(account)}</span>
        </div>
        );
    }

    return (
        <button
        onClick={handleConnect}
        disabled={loading}
        className="btn btn-primary"
        >
        {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
    );
};

export default MetaMaskConnect;