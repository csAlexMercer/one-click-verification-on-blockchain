const Web3Service = {
  isMetaMaskInstalled: () => typeof window.ethereum !== 'undefined',
  
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('Please install MetaMask');
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    return accounts[0];
  },
  
  async getCurrentAccount() {
    if (!this.isMetaMaskInstalled()) return null;
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    return accounts[0] || null;
  },
  
  formatAddress: (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  onAccountsChanged: (callback) => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  },

  removeAccountsListener: (callback) => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', callback);
    }
  }
};

export default Web3Service;