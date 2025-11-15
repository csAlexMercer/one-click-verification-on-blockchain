import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { ToastContainer } from './components/Toast';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import IssuePage from './pages/IssueCertificate';
import HolderDashboard from './pages/HolderDashboard';
import VerifyPage from './pages/CertificateVerification';
import Web3Service from './services/web3';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Admin address from deployment info
  const ADMIN_ADDRESS = '0x31CcD39D841f15462015982A366D00deA1c2Ec99'.toLowerCase();
  
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  useEffect(() => {
    checkConnection();
    Web3Service.onAccountsChanged(handleAccountChange);
    
    return () => {
      Web3Service.removeAccountsListener(handleAccountChange);
    };
  }, []);
  
  const checkConnection = async () => {
    const acc = await Web3Service.getCurrentAccount();
    if (acc) {
      setAccount(acc);
      setIsAdmin(acc.toLowerCase() === ADMIN_ADDRESS);
    }
  };
  
  const handleAccountChange = (accounts) => {
    const acc = accounts[0] || null;
    setAccount(acc);
    setIsAdmin(acc?.toLowerCase() === ADMIN_ADDRESS);
    if (!acc) {
      showToast('Wallet disconnected', 'error');
      setCurrentPage('home');
    }
  };
  
  const handleAdminClick = async () => {
    try {
      const acc = await Web3Service.connectWallet();
      setAccount(acc);
      if (acc.toLowerCase() === ADMIN_ADDRESS) {
        setIsAdmin(true);
        setCurrentPage('admin-dashboard');
        showToast('Admin access granted', 'success');
      } else {
        showToast('Not authorized as admin', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setPage={setCurrentPage} />;
      case 'register':
        return <RegisterPage showToast={showToast} />;
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboard showToast={showToast} /> : <HomePage setPage={setCurrentPage} />;
      case 'issue':
        return <IssuePage account={account} showToast={showToast} />;
      case 'holder':
        return <HolderDashboard showToast={showToast} />;
      case 'verify':
        return <VerifyPage showToast={showToast} />;
      default:
        return <HomePage setPage={setCurrentPage} />;
    }
  };
  
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Layout 
        onHomeClick={() => setCurrentPage('home')}
        onAdminClick={handleAdminClick}
      >
        {renderPage()}
      </Layout>
    </>
  );
};

export default App;