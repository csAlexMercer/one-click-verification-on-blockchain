import Web3Service from './web3';
import IssuerRegistryABI from '../contracts/IssuerRegistry.json';
import CertificateStoreABI from '../contracts/CertificateStore.json';

const ISSUER_REGISTRY_ADDRESS = '0xB4A5aCE43572F24Fe2270A7927D5cd26b9621adE';
const CERTIFICATE_STORE_ADDRESS = '0xD626C4CD890580eB35A4C2008F249E5098bEC4F8';
const DEPLOYER_ADDRESS = process.env.REACT_APP_DEPLOYER_ADDRESS;

export const getIssuerRegistryContract = () => {
    const web3 = Web3Service();
    return new web3.eth.Contract(
        IssuerRegistryABI.abi,
        ISSUER_REGISTRY_ADDRESS
    );
};

export const getCertificateStoreContract = () => {
    const web3 = Web3Service();
    return new web3.eth.Contract(
        CertificateStoreABI.abi,
        CERTIFICATE_STORE_ADDRESS
    );
};

export const isRegisteredIssuer = async (address) => {
    try {
        const contract = getIssuerRegistryContract();
        return await contract.methods.isRegisteredIssuer(address).call();
    } catch (error) {
        console.error('Error checking issuer:', error);
        return false;
    }
};

export const getIssuerInfo = async (address) => {
    try {
        const contract = getIssuerRegistryContract();
        const info = await contract.methods.getIssuerInfo(address).call();
        
        return {
        name: info[0],
        location: info[1],
        registrationTime: parseInt(info[2]),
        isActive: info[3],
        totalCertificates: parseInt(info[4]),
        };
    } catch (error) {
        console.error('Error getting issuer info:', error);
        return null;
    }
};

export const getActiveIssuersFromContract = async (start = 0, limit = 50) => {
    try {
        const contract = getIssuerRegistryContract();
        const result = await contract.methods.getActiveIssuers(start, limit).call();
        
        return {
        addresses: result[0],
        names: result[1],
        hasMore: result[2],
        };
    } catch (error) {
        console.error('Error getting active issuers:', error);
        return { addresses: [], names: [], hasMore: false };
    }
};

export const getIssuerStats = async () => {
    try {
        const contract = getIssuerRegistryContract();
        const stats = await contract.methods.getContractStats().call();
        
        return {
        totalIssuers: parseInt(stats[0]),
        activeIssuers: parseInt(stats[1]),
        totalCertificates: parseInt(stats[2]),
        };
    } catch (error) {
        console.error('Error getting issuer stats:', error);
        return { totalIssuers: 0, activeIssuers: 0, totalCertificates: 0 };
    }
};

export const registerIssuer = async (issuerAddress, name, location) => {
    try{
        const contract = getIssuerRegistryContract();
        const gasEstimate = await contract.methods.registerIssuer(
            issuerAddress, name, location
        ).estimateGas({from: DEPLOYER_ADDRESS});
        const tx = await contract.methods.registerIssuer(issuerAddress, name, location)
        .send({
            from: DEPLOYER_ADDRESS,
            gas: Math.floor(gasEstimate * 1.2)
        });
        return { success: true, tx}
    }catch (error){
        console.error('Error registering issuer', error);
        throw error;
    }
}

export const issueCertificate = async (certificateHash, recipientAddress, fromAddress) => {
    try {
        const contract = getCertificateStoreContract();
        
        // Estimate gas first
        const gasEstimate = await contract.methods
        .issueCertificate(certificateHash, recipientAddress)
        .estimateGas({ from: fromAddress });
        
        // Send transaction with MetaMask
        const tx = await contract.methods
        .issueCertificate(certificateHash, recipientAddress)
        .send({ 
            from: fromAddress,
            gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
        });
        
        return { success: true, tx };
    } catch (error) {
        console.error('Error issuing certificate:', error);
        throw error;
    }
};

export const verifyCertificate = async (certificateHash) => {
    try {
        const contract = getCertificateStoreContract();
        const result = await contract.methods.verifyCertificate(certificateHash).call();
        
        return {
        isValid: result[0],
        issuer: result[1],
        recipient: result[2],
        issuanceTime: parseInt(result[3]),
        isRevoked: result[4],
        issuerName: result[5],
        };
    } catch (error) {
        console.error('Error verifying certificate:', error);
        return {
        isValid: false,
        issuer: '',
        recipient: '',
        issuanceTime: 0,
        isRevoked: false,
        issuerName: '',
        };
    }
};

export const isCertificateValid = async (certificateHash) => {
    try {
        const contract = getCertificateStoreContract();
        return await contract.methods.isCertificateValid(certificateHash).call();
    } catch (error) {
        console.error('Error checking certificate validity:', error);
        return false;
    }
};

export const getCertificatesForRecipient = async (recipientAddress, start = 0, limit = 100) => {
    try {
        const contract = getCertificateStoreContract();
        const result = await contract.methods
        .getCertificatesForRecipient(recipientAddress, start, limit)
        .call();
        
        return {
        hashes: result[0],
        hasMore: result[1],
        };
    } catch (error) {
        console.error('Error getting recipient certificates:', error);
        return { hashes: [], hasMore: false };
    }
};

export const getCertificateDetails = async (certificateHash) => {
    try {
        const contract = getCertificateStoreContract();
        const details = await contract.methods.getCertificateDetails(certificateHash).call();
        
        return {
        certificateHash: details[0],
        issuer: details[1],
        recipient: details[2],
        issuanceTime: parseInt(details[3]),
        isRevoked: details[4],
        revocationTime: parseInt(details[5]),
        };
    } catch (error) {
        console.error('Error getting certificate details:', error);
        return null;
    }
};

export const getTotalCertificates = async () => {
    try {
        const contract = getCertificateStoreContract();
        return parseInt(await contract.methods.getTotalCertificates().call());
    } catch (error) {
        console.error('Error getting total certificates:', error);
        return 0;
    }
};

export const getCertificateStats = async () => {
    try {
        const contract = getCertificateStoreContract();
        const stats = await contract.methods.getContractStats().call();
        
        return {
        totalCertificates: parseInt(stats[0]),
        totalRevoked: parseInt(stats[1]),
        };
    } catch (error) {
        console.error('Error getting certificate stats:', error);
        return { totalCertificates: 0, totalRevoked: 0 };
    }
};

export const revokeCertificate = async (certificateHash, fromAddress) => {
    try {
        const contract = getCertificateStoreContract();
        
        const gasEstimate = await contract.methods
        .revokeCertificate(certificateHash)
        .estimateGas({ from: fromAddress });
        
        const tx = await contract.methods
        .revokeCertificate(certificateHash)
        .send({
            from: fromAddress,
            gas: Math.floor(gasEstimate * 1.2),
        });
        
        return { success: true, tx };
    } catch (error) {
        console.error('Error revoking certificate:', error);
        throw error;
    }
};

export const batchIssueCertificates = async (certificateHashes, recipientAddresses, fromAddress) => {
    try {
        const contract = getCertificateStoreContract();
        
        const gasEstimate = await contract.methods
        .batchIssueCertificates(certificateHashes, recipientAddresses)
        .estimateGas({ from: fromAddress });
        
        const tx = await contract.methods
        .batchIssueCertificates(certificateHashes, recipientAddresses)
        .send({
            from: fromAddress,
            gas: Math.floor(gasEstimate * 1.2),
        });
        
        return { success: true, tx };
    } catch (error) {
        console.error('Error batch issuing certificates:', error);
        throw error;
    }
};

export const subscribeToCertificateIssued = (callback, options = {}) => {
    try {
        const contract = getCertificateStoreContract();
        return contract.events.CertificateIssued(options)
        .on('data', callback)
        .on('error', console.error);
    } catch (error) {
        console.error('Error subscribing to CertificateIssued:', error);
        return null;
    }
};

export const subscribeToCertificateRevoked = (callback, options = {}) => {
    try {
        const contract = getCertificateStoreContract();
        return contract.events.CertificateRevoked(options)
        .on('data', callback)
        .on('error', console.error);
    } catch (error) {
        console.error('Error subscribing to CertificateRevoked:', error);
        return null;
    }
};

export const subscribeToIssuerRegistered = (callback, options = {}) => {
    try {
        const contract = getIssuerRegistryContract();
        return contract.events.IssuerRegistered(options)
        .on('data', callback)
        .on('error', console.error);
    } catch (error) {
        console.error('Error subscribing to IssuerRegistered:', error);
        return null;
    }
};

export default {
  // Issuer Registry
  isRegisteredIssuer,
  getIssuerInfo,
  getActiveIssuersFromContract,
  getIssuerStats,
  
  // Certificate Store
  issueCertificate,
  verifyCertificate,
  isCertificateValid,
  getCertificatesForRecipient,
  getCertificateDetails,
  getTotalCertificates,
  getCertificateStats,
  revokeCertificate,
  batchIssueCertificates,
  
  // Event listeners
  subscribeToCertificateIssued,
  subscribeToCertificateRevoked,
  subscribeToIssuerRegistered,
};