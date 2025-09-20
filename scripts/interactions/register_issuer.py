from brownie import network, IssuerRegistry
from scripts.help_scripts import (create_sample_institution_data, get_account,load_deployment_info, print_section)
import time 
def register_sample_issuers():
    print("REGISTERING SAMPLE INSTITUTIONS")
    deployment_info = load_deployment_info("IssuerRegistry", network.show_active())
    if not deployment_info:
        print("IssuerRegistry not deployed. Run deploy_IssuerRegistry.py first")
        return None
    
    contract_address = deployment_info["address"]
    print_section("Contract Information")
    print(f"IssuerRegistry Address: {contract_address}")
    issuer_registry = IssuerRegistry.at(contract_address)
    owner = get_account()
    print(f"Owner Account: {owner.address}")
    print(f"Owner Balance: {owner.balance() / 1e18:.4f} ETH")

    contract_owner = issuer_registry.owner()
    if contract_owner != owner.address:
        print(f"Account mismatch. Contract owner: {contract_owner}")
        return None
    institutions = create_sample_institution_data()
    print_section("Registering Institutions")
    registered_count = 0
    total_gas_used = 0

    for i, institution in enumerate(institutions, 1):
        print(f"\nRegistering Institution {i}/{len(institutions)}")
        print(f"Name: {institution['name']}")
        print(f"Location: {institution['location']}")
        print(f"Address: {institution['address']}")

        try:
            if issuer_registry.isAddressRegistered(institution['address']):
                print("! Already registered. skipping...")
                continue
            gas_estimate = issuer_registry.registerIssuer.estimate_gas(
                institution["address"],
                institution["name"],
                institution["location"],
                {'from': owner}
            )
            print(f"Estimated Gas: {gas_estimate:,}")
            tx = issuer_registry.registerIssuer(
                institution["address"],
                institution["name"],
                institution["location"], {'from': owner}
            )
            tx.wait(1)

            print(f"Registration successful!")
            print(f"Transaction Hash: {tx.txid}")
            print(f"Gas Used: {tx.gas_used:,}")
            registered_count += 1
            total_gas_used += tx.gas_used

            if "IssuerRegistered" in tx.events:
                event = tx.events["IssuerRegistered"][0]
                print(f"Event Emitted: IssuerRegistered")
                print(f" - Issuer: {event['issuerAddress']}")
                print(f" - Name: {event['name']}")
                print(f" - Timestamp: {event['timestamp']}")

            time.sleep(1)
        except Exception as e:
            print(f"Registration failed: {e}")
            continue
    print_section("Registration Summary")
    print(f"Total Institutions Processed: {len(institutions)}")
    print(f"Successfully Registered: {registered_count}")
    print(f"Total Gas Used: {total_gas_used:,}")
    print(f"Average Gas Per Registration: {total_gas_used / max(registered_count, 1):,}")
    print_section("Contract State Verification")
    total_issuers = issuer_registry.getTotalIssuers()
    print(f"Total Issuers in Contract: {total_issuers}")

    stats = issuer_registry.getContractStats()
    print(f"Contract Statistics:")
    print(f" - Total Registered: {stats[0]}")
    print(f" - Total Active: {stats[1]}")
    print(f" - Total Certificate: {stats[2]}")

    if total_issuers > 0:
        print_section("Registered Issuers")
        addresses, has_more = issuer_registry.getAllIssuers(0,10)
        for i, addr in enumerate(addresses, 1):
            try:
                info = issuer_registry.getIssuerInfo(addr)
                status = "Active" if info[3] else "Inactive"
                print(f"{i}. {info[0]} ({status})")
                print(f" Location: {info[1]}")
                print(f" Address: {addr}")
                print(f" Registered: {time.ctime(info[2])}")
                print(f" Certificates Issued: {info[4]}")
                print()
            except Exception as e:
                print(f"Error getting info for {addr}: {e}")
    return issuer_registry

def main():
    return register_sample_issuers()

if __name__ == "__main__":
    main()
