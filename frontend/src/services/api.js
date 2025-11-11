import axios from 'axios';

const API_BASE_URL = ProcessingInstruction.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const registerIssuer = async (issuerAddress, name, location) => {
    try {
        const response = await api.post('/issuer/register', {
        issuer_address: issuerAddress,
        name: name,
        location: location,
        });
        return response.data;
    } catch (error) {
        console.error('Error registering issuer:', error);
        throw error;
    }
};

export const getActiveIssuers = async () => {
    try {
        const response = await api.get('/issuer/active');
        return response.data;
    } catch (error) {
        console.error('Error getting active issuers:', error);
        throw error;
    }
};

export const checkIssuer = async (address) => {
    try {
        const response = await api.get(`/issuer/check/${address}`);
        return response.data;
    } catch (error) {
        console.error('Error checking issuer:', error);
        throw error;
    }
};

export const calculateHash = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/certificate/calculate-hash', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });
        return response.data;
    } catch (error) {
        console.error('Error calculating hash:', error);
        throw error;
    }
};

export const getRecipientCertificates = async (address) => {
    try {
        const response = await api.get(`/certificate/recipient/${address}`);
        return response.data;
    } catch (error) {
        console.error('Error getting recipient certificates:', error);
        throw error;
    }
};

export const getStats = async () => {
    try {
        const response = await api.get('/certificate/stats');
        return response.data;
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
};

export const verifyByFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/verify/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying by file:', error);
        throw error;
    }
};

export const verifyByHash = async (hash) => {
    try {
        const response = await api.post('/verify/hash', {
        hash: hash,
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying by hash:', error);
        throw error;
    }
};

export const healthCheck = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

export default {
    registerIssuer,
    getActiveIssuers,
    checkIssuer,
    calculateHash,
    getRecipientCertificates,
    getStats,
    verifyByFile,
    verifyByHash,
    healthCheck,
};


