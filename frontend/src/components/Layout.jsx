import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Certificate Verification</h1>
            
            <nav className="flex space-x-2">
              <Link to="/admin/dashboard" className={`px-4 py-2 rounded-lg ${isActive('/admin/dashboard')}`}>
                Admin Dashboard
              </Link>
              <Link to="/admin/register" className={`px-4 py-2 rounded-lg ${isActive('/admin/register')}`}>
                Register Institution
              </Link>
              <Link to="/issue-certificate" className={`px-4 py-2 rounded-lg ${isActive('/issue-certificate')}`}>
                Issue Certificate
              </Link>
              <Link to="/my-certificates" className={`px-4 py-2 rounded-lg ${isActive('/my-certificates')}`}>
                My Certificates
              </Link>
              <Link to="/verify" className={`px-4 py-2 rounded-lg ${isActive('/verify')}`}>
                Verify
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Certificate Verification System. Powered by Blockchain.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;