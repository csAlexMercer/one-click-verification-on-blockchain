from brownie import network, IssuerRegistry
from scripts.help_scripts import (format_address, print_section, get_account, load_deployment_info)
import time

def demo_admin_operations():
    print("ADMINISTRATION OPERATIONS")
    deployment_info = load_deployment_info("IssuerRegistry", network.show_active())
    if not deployment_info:
        print("IssuerRegistry not deployed.")
        return None
    contract_address = deployment_info["address"]
    issuer_registry = IssuerRegistry.at(contract_address)
    owner = get_account()

    print_section("Contract and Owner Information")
    print(f"Contract Address: {contract_address}")
    print(f"Owner Address: {owner.address}")
    print(f"Owner Balance: {owner.balance()/1e18:.4f} ETH")

    contract_owner = issuer_registry.owner()
    if contract_owner != owner.address:
        print(f"Account mismatch. Contract owner: {contract_owner}")
        return None
    total_issuers = issuer_registry.getTotalIssuers()
    if total_issuers == 0:
        print("No issuers registered.")
        return issuer_registry
    
    stats = issuer_registry.getContractStats()
    print(f"Current Statistics:")
    print(f" - Total Registered: {stats[0]}")
    print(f" - Total Active: {stats[1]}")
    print(f" - Total Certificates: {stats[2]}")

    addresses, _ = issuer_registry.getAllIssuers(0,1)
    if not addresses:
        print(" No issuers available.")
        return issuer_registry
    demo_issuer_address = addresses[0]

    print_section("1. Issuer Information:")
    print("Current Issuer Information:")
    info = issuer_registry.getIssuerInfo(demo_issuer_address)
    current_name = info[0]
    current_location = info[1]
    print(f" Name: {current_name}")
    print(f" Location: {current_location}")
    print(f" Address: {format_address(demo_issuer_address)}")

    print("\n Updating issuer information..")
    new_name = f"{current_name} - Updated"
    new_location = f"{current_location} - New Campus"

    try:
        tx = issuer_registry.updateIssuer(demo_issuer_address, new_name, new_location, {'from':owner})
        tx.wait(1)

        print(f" Update successfully")
        print(f"Trasaction Hash: {tx.txid}")
        print(f"Gas Used: {tx.gas_used:,}")

        updated_info = issuer_registry.getIssuerInfo(demo_issuer_address)
        print(f"\n Updated Information:")
        print(f" Name: {updated_info[0]}")
        print(f" Location: {updated_info[1]}")

        if "IssuerUpdated" in tx.events:
            event = tx.events["IssuerUpdated"][0]
            print(f"\n Event Emitted:")
            print(f" Event: IssuerUpdated")
            print(f" Issuer: {format_address(event['issuerAddress'])}")
            print(f" New Name: {event['name']}")
            print(f" Timestamp: {time.ctime(event['timestamp'])}")
        
    except Exception as e:
        print(f" Update failed: {e}")

    print_section("2. Issuer Deactivation")
    is_active_before = issuer_registry.isRegisteredIssuer(demo_issuer_address)
    print(f"Current Status: {'Active' if is_active_before else 'Inactive'}")
    if is_active_before:
        print("Deactivating issuer...")

        try:
            tx = issuer_registry.deactivateIssuer(demo_issuer_address, {'from': owner})
            tx.wait(1)
            print(f"Deactivate successful!")
            print(f"Transaction Hash: {tx.txid}")
            print(f"Gas Used: {tx.gas_used:,}")

            is_active_after = issuer_registry.isRegisteredIssuer(demo_issuer_address)
            is_still_registered = issuer_registry.isAddressRegistered(demo_issuer_address)

            print(f"\n Status Check:")
            print(f"  Is Registered & Active: {'Yes' if is_active_after else 'No'}")
            print(f" Is Address Registered: {'Yes' if is_still_registered else 'No'}")

            if "IssuerDeactivated" in tx.events:
                event = tx.events["IssuerDeactivated"][0]
                print(f"\n Event Emitted:")
                print(f" Event: IssuerDeactivated")
                print(f" Issuer: {format_address(event['IssuerAddress'])}")
                print(f" Timestamp: {time.ctime(event['timestamp'])}")

        except Exception as e:
            print(f" Deactivation failed: {e}")
    else:
        print(f"Issuer is Already Inactive!!")
                    

