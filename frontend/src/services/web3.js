import Web3 from 'web3';

let web3Instance = null;
let currentAccount = null;

export const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
};

export const getWeb3 = () => {
    if (!isMetaMaskInstalled()){
        throw new Error('Metamask is not installed');
    }
    if(!web3Instance){
        web3Instance = new Web3(window.ethereum);
    }
    return web3Instance;
};

export const connectWallet = async () => {
    try{
        if(!isMetaMaskInstalled()){
            throw new Error('Please install MetaMask');
        }
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        currentAccount = accounts[0];
        return currentAccount;
    }catch (error){
        console.error('Error connecting wallet:', error);
        throw error;
    }
};

export const getCurrentAccount = async () => {
    try {
        const web3 = getWeb3();
        const accounts = await web3.eth.getAccounts();
        currentAccount = accounts[0] || null;
        return currentAccount;
    } catch (error) {
        console.error('Error getting account:', error);
        return null;
    }
};

export const getBalance = async (address) => {
    try {
        const web3 = getWeb3();
        const balance = await web3.eth.getBalance(address);
        return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error('Error getting balance:', error);
        return '0';
    }
};

export const getNetworkId = async () => {
    try {
        const web3 = getWeb3();
        return await web3.eth.net.getId();
    } catch (error) {
        console.error('Error getting network ID:', error);
        return null;
    }
};

export const onAccountsChanged = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            currentAccount = accounts[0] || null;
            callback(currentAccount);
        });
    }
};

export const onChainChanged = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', (chainId) => {
            callback(parseInt(chainId, 16));
        });
    }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default {
    isMetaMaskInstalled,
    getWeb3,
    connectWallet,
    getCurrentAccount,
    getBalance,
    getNetworkId,
    onAccountsChanged,
    onChainChanged,
    formatAddress,
};