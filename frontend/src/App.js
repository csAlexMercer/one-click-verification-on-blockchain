import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
// import IssueCertificate from './pages/IssueCertificate';
// import HolderDashboard from './pages/HolderDashboard';
// import Verification from './pages/Verification';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* <Route path="/issue-certificate" element={<IssueCertificate />} />
          <Route path="/my-certificates" element={<HolderDashboard />} />
          <Route path="/verify" element={<Verification />} /> */}
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;