import React from 'react';
import MyBg from '../assets/1clickverificationbg.png'

const Layout = ({ children, onHomeClick, onAdminClick }) => {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{backgroundImage: `url(${MyBg})`}}>
      
      {/* Top Navigation Bar */}
      <div className="w-full h-[8vh] bg-black bg-opacity-50 flex items-center justify-between px-8">
        <button 
          onClick={onHomeClick}
          className="text-white text-3xl font-bold hover:text-gray-300 transition"
        >
          One-Click Verification
        </button>
        <button 
          onClick={onAdminClick}
          className="bg-white bg-opacity-20 text-white px-6 py-2 rounded hover:bg-opacity-30 transition"
        >
          Admin
        </button>
      </div>
      
      {/* Page Content */}
      <div className="w-full" style={{minHeight: '95vh'}}>
        {children}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;