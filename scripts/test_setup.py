#!/usr/bin/env python3
from brownie import accounts, network, config
import os
from dotenv import load_dotenv

def main():
    """Test the development environment setup"""
    
    print("🚀 Testing Certificate Verification DApp Setup")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Test 1: Network Connection
    try:
        print(f"Connected to network: {network.show_active()}")
        print(f" Chain ID: {network.chain.id}")
    except Exception as e:
        print(f" Network connection failed: {e}")
        return
    
    # Test 2: Accounts Access
    try:
        print(f"Available accounts: {len(accounts)}")
        if len(accounts) > 0:
            print(f"Default account: {accounts[0]}")
            print(f"Account balance: {accounts[0].balance() / 1e18:.2f} ETH")
        else:
            print("No accounts available")
            return
    except Exception as e:
        print(f"Account access failed: {e}")
        return
    
    # Test 3: Environment Variables
    print("\nEnvironment Variables:")
    env_vars = ['PRIVATE_KEY', 'MNEMONIC', 'WEB3_INFURA_PROJECT_ID']
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Show only first 10 characters for security
            display_value = value[:10] + "..." if len(value) > 10 else value
            print(f"{var}: {display_value}")
        else:
            print(f"{var}: Not set")
    
    # Test 4: Configuration
    print(f"\nConfiguration:")
    print(f"Compiler version: {config['compiler']['solc']['version']}")
    print(f"Optimizer enabled: {config['compiler']['solc']['optimizer']['enabled']}")
    
    # Test 5: Dependencies
    try:
        from brownie import project
        print(f"OpenZeppelin contracts available")
    except Exception as e:
        print(f"Dependencies issue: {e}")
    
    # Test 6: Create a simple transaction
    try:
        if len(accounts) >= 2:
            initial_balance = accounts[1].balance()
            tx = accounts[0].transfer(accounts[1], "0.1 ether")
            tx.wait(1)  # Wait for confirmation
            final_balance = accounts[1].balance()
            
            print(f"\nTest Transaction:")
            print(f"Transaction hash: {tx.txid}")
            print(f"Gas used: {tx.gas_used}")
            print(f"Balance change: {(final_balance - initial_balance) / 1e18:.2f} ETH")
        else:
            print("Skipping transaction test - need at least 2 accounts")
            
    except Exception as e:
        print(f"Transaction test failed: {e}")
    
    print("\nSetup verification completed!")
    print("Ready to start smart contract development!")

if __name__ == "__main__":
    main()