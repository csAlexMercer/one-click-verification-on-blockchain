from brownie import IssuerRegistry, accounts, network
from scripts.help_scripts import (get_account, print_section, print_transaction_details, save_deployment_info)

def deploy_issuer_registry():
    print("DEPLOYING ISSUER REGISTRY CONTRACT")
    account = get_account()
    # print_section("Deployment Account")
    # print(f"Deploying from: {account.address}")
    # print(f"Balance: {account.balance()/1e18:.4f} ETH")
    # print_section("Contract Deployment")
    # print("Deploying IssuerRegistry contract...")

    try:
        issuer_registry = IssuerRegistry.deploy({'from': account})
        print(f"Contract Deployed Successfully")
        print(f"Contract Address: {issuer_registry.address}")
        print(f"Transaction Hash: {issuer_registry.tx.txid}")

        print("Transaction Details")
        print_transaction_details(issuer_registry.tx)
        print_section("Deployment Verification")
        owner = issuer_registry.owner()
        print(f"Contract Owner: {owner}")
        print(f"Owner Match: {'YES' if owner == account.address else 'NO'}")

        # total_issuers = issuer_registry.getTotalIssuers()
        # print(f"Initital Issuer Count: {total_issuers}")
        # stats = issuer_registry.getContractStats()
        # print(f"Contract Stats: ")
        # print(f" -Total Registered: {stats[0]}")
        # print(f" -Total Active: {stats[1]}")
        # print(f" -Total Certificates: {stats[2]}")

        save_deployment_info("IssuerRegistry", issuer_registry.address,network.show_active())
        # print_section("Next Steps")
        # print("1. Register sample institutions using register_issuers.py")
        # print("2. Run tests with: brownie test tests/test_issuer_registry.py")
        # print("3. Interact with contract using interaction scripts")
        return issuer_registry
    except Exception as e:
        print(f"Depoyment failed: {e}")
        return None
    
def main():
    return deploy_issuer_registry()
if __name__ == "__main__":
    main()