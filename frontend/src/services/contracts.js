import Web3 from 'web3';
import IssuerRegistryABI from '../contracts/IssuerRegistry.json';
import CertificateStoreABI from '../contracts/CertificateStore.json';

const ISSUER_REGISTRY_ADDRESS = process.env.REACT_APP_ISSUER_REGISTRY;
const CERTIFICATE_STORE_ADDRESS = process.env.REACT_APP_CERTIFICATE_STORE;
const DEPLOYER_ADDRESS = process.env.REACT_APP_DEPLOYER_ADDRESS;

const requireAddress = (value, name) => {
    if (!value) {
        throw new Error(`Missing ${name} environment variable`);
    }
    return value;
};

const withGasBuffer = (gasEstimate, bufferPercent = 20) => {
    // Keep this Number-based for compatibility with browsers/toolchains that don't expose BigInt.
    const baseGas = Number(gasEstimate);
    if (!Number.isFinite(baseGas) || baseGas <= 0) {
        throw new Error(`Invalid gas estimate: ${gasEstimate}`);
    }
    return Math.ceil(baseGas * (1 + bufferPercent / 100)).toString();
};

export const getIssuerRegistryContract = () => {
    const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
    return new web3.eth.Contract(
        IssuerRegistryABI.abi,
        requireAddress(ISSUER_REGISTRY_ADDRESS, 'REACT_APP_ISSUER_REGISTRY')
    );
};

export const getCertificateStoreContract = () => {
    const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
    return new web3.eth.Contract(
        CertificateStoreABI.abi,
        requireAddress(CERTIFICATE_STORE_ADDRESS, 'REACT_APP_CERTIFICATE_STORE')
    );
};

export const isRegisteredIssuer = async (address) => {
    try {
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumAddress = web3.utils.toChecksumAddress(address);
        const contract = getIssuerRegistryContract();
        return await contract.methods.isRegisteredIssuer(checksumAddress).call();
    } catch (error) {
        console.error('Error checking issuer:', error);
        return false;
    }
};

export const getIssuerInfo = async (address) => {
    try {
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumAddress = web3.utils.toChecksumAddress(address);
        const contract = getIssuerRegistryContract();
        const info = await contract.methods.getIssuerInfo(checksumAddress).call();
        
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
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumIssuerAddress = web3.utils.toChecksumAddress(issuerAddress);
        const contract = getIssuerRegistryContract();
        const deployerAddress = web3.utils.toChecksumAddress(requireAddress(DEPLOYER_ADDRESS, 'REACT_APP_DEPLOYER_ADDRESS'));
        const gasEstimate = await contract.methods.registerIssuer(
            checksumIssuerAddress, name, location
        ).estimateGas({from: deployerAddress});
        const tx = await contract.methods.registerIssuer(checksumIssuerAddress, name, location)
        .send({
            from: deployerAddress,
            gas: withGasBuffer(gasEstimate)
        });
        return { success: true, tx}
    }catch (error){
        console.error('Error registering issuer', error);
        throw error;
    }
}

export const issueCertificate = async (certificateHash, recipientAddress, fromAddress) => {
    try {
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumRecipient = web3.utils.toChecksumAddress(recipientAddress);
        const checksumFrom = web3.utils.toChecksumAddress(fromAddress);
        
        // Ensure hash has 0x prefix for bytes32 validation
        const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : '0x' + certificateHash;
        
        const contract = getCertificateStoreContract();
        
        // Estimate gas first
        const gasEstimate = await contract.methods
        .issueCertificate(hashWithPrefix, checksumRecipient)
        .estimateGas({ from: checksumFrom });
        
        // Send transaction with MetaMask
        const tx = await contract.methods
        .issueCertificate(hashWithPrefix, checksumRecipient)
        .send({ 
            from: checksumFrom,
            gas: withGasBuffer(gasEstimate)
        });
        
        return { success: true, tx };
    } catch (error) {
        console.error('Error issuing certificate:', error);
        throw error;
    }
};

export const verifyCertificate = async (certificateHash) => {
    try {
        // Ensure hash has 0x prefix for bytes32 validation
        const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : '0x' + certificateHash;
        
        const contract = getCertificateStoreContract();
        const result = await contract.methods.verifyCertificate(hashWithPrefix).call();
        
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
        // Ensure hash has 0x prefix for bytes32 validation
        const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : '0x' + certificateHash;
        
        const contract = getCertificateStoreContract();
        return await contract.methods.isCertificateValid(hashWithPrefix).call();
    } catch (error) {
        console.error('Error checking certificate validity:', error);
        return false;
    }
};

export const getCertificatesForRecipient = async (recipientAddress, start = 0, limit = 100) => {
    try {
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumRecipient = web3.utils.toChecksumAddress(recipientAddress);
        const contract = getCertificateStoreContract();
        const result = await contract.methods
        .getCertificatesForRecipient(checksumRecipient, start, limit)
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
        // Ensure hash has 0x prefix for bytes32 validation
        const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : '0x' + certificateHash;
        
        const contract = getCertificateStoreContract();
        const details = await contract.methods.getCertificateDetails(hashWithPrefix).call();
        
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
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumFrom = web3.utils.toChecksumAddress(fromAddress);
        const hashWithPrefix = certificateHash.startsWith('0x') ? certificateHash : '0x' + certificateHash;
        const contract = getCertificateStoreContract();
        
        const gasEstimate = await contract.methods
        .revokeCertificate(hashWithPrefix)
        .estimateGas({ from: checksumFrom });
        
        const tx = await contract.methods
        .revokeCertificate(hashWithPrefix)
        .send({
            from: checksumFrom,
            gas: withGasBuffer(gasEstimate),
        });
        
        return { success: true, tx };
    } catch (error) {
        console.error('Error revoking certificate:', error);
        throw error;
    }
};

export const batchIssueCertificates = async (certificateHashes, recipientAddresses, fromAddress) => {
    try {
        const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER);
        const checksumFrom = web3.utils.toChecksumAddress(fromAddress);
        const normalizedHashes = certificateHashes.map((hash) => (hash.startsWith('0x') ? hash : '0x' + hash));
        const checksumRecipients = recipientAddresses.map((address) => web3.utils.toChecksumAddress(address));
        const contract = getCertificateStoreContract();
        
        const gasEstimate = await contract.methods
        .batchIssueCertificates(normalizedHashes, checksumRecipients)
        .estimateGas({ from: checksumFrom });
        
        const tx = await contract.methods
        .batchIssueCertificates(normalizedHashes, checksumRecipients)
        .send({
            from: checksumFrom,
            gas: withGasBuffer(gasEstimate),
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