from brownie import network, CertificateStore, IssuerRegistry, accounts
from scripts.help_scripts import (save_deployment_info,print_transaction_details, get_account, print_section, load_deployment_info)

def deploy_certificateStore():
    print("DEPLOYING CERTIFICATE STORE")
    account = get_account()

    print_section("Deployment Account")
    print(f"Deploying from: {account.address}")
    print(f"Balance: {account.balance()/1e18:.4f} ETH")
    print_section("IssuerRegistry Integration")
    deployment_info = load_deployment_info("IssuerRegistry", network.show_active())
    
    if not deployment_info:
        print("IssuerRegistry not deployed")
        return None
    
    issuer_registry_address = deployment_info["address"]
    try:
        issuer_registry = IssuerRegistry.at(issuer_registry_address)
        total_issuers = issuer_registry.getTotalIssuers()
        print(f"IssuerRegistry verified: {total_issuers} registered issuers")
    except Exception as e:
        print(f"Error accessing IssuerRegistry: {e}")
        return None
    
    print_section("Contract Deployment")
    print(f"Deploying CertificateStore..")
    try: 
        certificate_store = CertificateStore.deploy(issuer_registry_address, {'from': account})
        print(f"Contract deployed successfully")
        print(f"Contract Address: {certificate_store.address}")
        print(f"Transaction Hash: {certificate_store.tx.txid}")
        print("Transaction Details..")
        print_transaction_details(certificate_store.tx)
        
        connected_registry = certificate_store.issuerRegistry()
        print(f"Connected IssuerRegistry: {connected_registry}")
        print(f"Address Match: {'Success' if connected_registry == issuer_registry_address else 'Failed'}")

        total_certificates = certificate_store.getTotalCertificates()
        print(f"Initial Certificate Count: {total_certificates}")

        stats = certificate_store.getContractStats()
        print(f"Contract Stats:")
        print(f"  -Total Certificates: {stats[0]}")
        print(f"  -Total Revoked: {stats[1]}")

        print_section("Integration Test")
        if total_issuers>0:
            addresses, _ = issuer_registry.getAllIssuers(0,1)
            if addresses:
                test_issuer = addresses[0]
                print(f"Testing with issuer: {test_issuer}")

                print(f"Integration with IssuerRegistry working")
        
        save_deployment_info(
            "CertificateStore",
            certificate_store.address,
            network.show_active()
        )

        print_section("Deployment Complete")
        print(f" Contract: CertificateStore")
        print(f" Address: {certificate_store.address}")
        print(f" IssuerRegistry: {issuer_registry_address}")
        print(f" Network: {network.show_active()}")

        return certificate_store
    except Exception as e:
        print(f"Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        return None
    
def main():
    return deploy_certificateStore()

if __name__ == "__main__":
    main()