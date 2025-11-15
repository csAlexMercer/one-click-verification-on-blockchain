const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const api = {
  async registerInstitution(data) {
    const res = await fetch(`${API_BASE}/issuer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async getPendingRegistrations() {
    const res = await fetch(`${API_BASE}/issuer/pending`);
    return res.json();
  },
  
  async getActiveIssuers() {
    const res = await fetch(`${API_BASE}/issuer/active`);
    return res.json();
  },
  
  async getStats() {
    const res = await fetch(`${API_BASE}/certificate/stats`);
    return res.json();
  },
  
  async verifyByFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/verify/file`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  
  async calculateHash(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/certificate/calculate-hash`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  
  async getRecipientCertificates(address) {
    const res = await fetch(`${API_BASE}/certificate/recipient/${address}`);
    return res.json();
  },

  async checkIssuer(address) {
    const res = await fetch(`${API_BASE}/issuer/check/${address}`);
    return res.json();
  }
};

export default api;