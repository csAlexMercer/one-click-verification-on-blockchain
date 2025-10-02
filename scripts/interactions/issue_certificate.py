from brownie import accounts, IssuerRegistry, CertificateStore, network
from scripts.help_scripts import (format_address,print_section, load_deployment_info)
from web3 import Web3
import time
def get_input():
    print_section("Certificate Details Input")
    print(f"\nEnter Certificate Information:")
    print("="*60)
    print("Enter certificat hash: ")
    cert_hash = None
    hash_input = input("Hash: ").strip()

    if hash_input.startswith('0x'):
        hash_input = hash_input[2:]

    if len(hash_input) != 64:
        print(f"Invalid hash length: {len(hash_input)}")
        return None, None
    
    try:
        cert_hash = bytes.fromhex(hash_input)
    except ValueError:
        print("Invalid hash format")
        return None, None
    
    print("\nEnter recipient address: ")
    print("Or enter 'demo' to use a default address")
    recipient_input = input("Recipient: ").strip()
    if recipient_input.lower() == 'demo':
        recipient = accounts[6].address
        print(f"Using demo address: {recipient}")
    else:
        if not recipient_input.startswith('0x'):
            recipient_input = '0x' + recipient_input
        if len(recipient_input) != 42:
            print(f"Invalid address length: {len(recipient_input)}")
            return None, None
        try:
            recipient = Web3.to_checksum_address(recipient_input)
            print(f"Address accepted: {recipient}")
        except Exception as e:
            print(f"Error occured: {e}")
            print("Invalid address format")
            return None, None
    return cert_hash, recipient

def select_issuer(issuer_registry):
    print_section("Select Issuer")
    active_addresses, active_names, _ = issuer_registry.getActiveIssuers(0,10)
    if len(active_addresses) == 0:
        print("No active issuers")
        return None
    print("\nActive Issuers:")
    for i, (addr, name) in enumerate(zip(active_addresses, active_names), 1):
        print(f" {i}. {name}")
        print(f"   Address: {format_address(addr)}")

    print("\nSelect issuer name:")
    choice = input("Choice: ").strip()
    
    try:
        choice_num = int(choice)
        if 1 <= choice_num <= len(active_addresses):
            selected_address = active_addresses[choice_num-1]
            selected_name = active_names[choice_num - 1]
            issuer_account = None
            for account in accounts:
                if account.address == selected_address:
                    issuer_account = account
                    break
                
            if issuer_account:
                print(f"\n Selected: {selected_name}")
                print(f" Address: {format_address(issuer_account.address)}")
                return issuer_account
            else:
                print(f"Could not find account for issuer")
                return None
        else:
            print(f"Invalid choice: {choice_num}")
            return None
        
    except ValueError:
        print(f"Invalid input: {choice}")
        return None
def issue_certificate():
    print_section("Loadting Contracts")
    cert_store_info  = load_deployment_info("CertificateStore", network.show_active())
    issuer_reg_info = load_deployment_info("IssuerRegistry", network.show_active())
    if not cert_store_info or not issuer_reg_info:
        print("Contracts not deployed")
        return None
    certificate_store = CertificateStore.at(cert_store_info["address"])
    issuer_registry = IssuerRegistry.at(issuer_reg_info["address"])
    print(f"CertificateStore: {certificate_store.address}")
    print(f"IssuerRegistry: {issuer_registry.address}")
    total_issuers = issuer_registry.getTotalIssuers()
    print(f"Total Registered Issuers: {total_issuers}")
    if total_issuers == 0:
        print("\n No issuers registered")
        return None
    issuer_account = select_issuer(issuer_registry)
    if not issuer_account:
        return None
    cert_hash, recipient = get_input()
    if not cert_hash or not recipient:
        print("\nInvalid input..")
        return None
    print(f"Certificate Details:")
    print(f"  Hash: 0x{cert_hash.hex()}")
    print(f"  Recipient: {recipient}")
    print(f"  Issuer: {format_address(issuer_account.address)}")
    
    try:
        verification = certificate_store.verifyCertificate(cert_hash)
        if verification[0]:
            print(f" WARNING: Certificate already exists!")
            print(f"  Issuer: {format_address(verification[1])}")
            print(f"  Recipient: {format_address(verification[2])}")
            print(f"  Issued: {time.ctime(verification[3])}")
            print(f"  Status: {'REVOKED' if verification[4] else 'ACTIVE'}")
            override = input("\nContinue anyway? (yes/no):").strip().lower()
            if override not in ['yes','y']:
                print("Issuance cancelled")
                return None
    except:
        print("Certificate does not exist, moving forward with issuance")
    
    print("Issuing Certificate")
    try:
        gas_estimate = certificate_store.issueCertificate.estimate_gas(
            cert_hash, recipient, {'from': issuer_account}
        )
        print(f" Estimated Gas: {gas_estimate}")
        tx = certificate_store.issueCertificate(
            cert_hash, recipient, {'from': issuer_account}
        )
        tx.wait(1)
        print(f"\nCertificate Issued successfully!")
        print(f"Transaction Details:")
        print(f"  Transaction Hash: {tx.txid}")
        print(f"  Gas Used: {tx.gas_used:,}")
        print(f"  Gas Price: {tx.gas_price / 1e0:.2f} Gwei")

        if "CertificateIssued" in tx.events:
            print(f"\nEvent Emitted")

        print("VERIFICATION:")
        verification = certificate_store.verifyCertificate(cert_hash)
        print(f" Valid: {verification[0]}")
        print(f" Issued: {time.ctime(verification[3])}")
        
        total_certs = certificate_store.getTotalCertificates()
        print(f"\nTotal Certificates in System: {total_certs}")
        return certificate_store
    except Exception as e:
        print(f"\nIssuance failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    print("\n" + "="*60)
    print(" CERTIFICATE ISSUANCE")
    print("\n")
    result = issue_certificate()
    if result:
        another = input("\nIssue another certificate? (yes/no): ").strip().lower()
        if another in ['yes','y']:
            main()
    return result

if __name__ == "__main__":
    main()