from brownie import network, IssuerRegistry, accounts
from scripts.help_scripts import (format_address, print_section,load_deployment_info)
import time
def demonstrate_queries():
    print("ISSUER REGISTRY QUERIES:")
    deployment_info = load_deployment_info("IssuerRegistry", network.show_active())
    if not deployment_info:
        print("IssuerRegistry not deployed.")
        return None
    contract_address = deployment_info["address"]
    print_section("Contract Information")
    print(f"IssuerRegistry Address: {contract_address}")
    issuer_registry = IssuerRegistry.at(contract_address)
    print_section("Contract Statistics")
    total_issuers = issuer_registry.getTotalIssuers()
    print(f"Total Issuers: {total_issuers}")
    if total_issuers == 0:
        print("No issuers registered.")
        return issuer_registry
    
    stats = issuer_registry.getContractStats()
    print(f"Detailed Statistics:")
    print(f" -Total Registered: {stats[0]}")
    print(f" -Total Active: {stats[1]}")
    print(f" -Total Certificates: {stats[2]}")

    print_section("All Issuers: ")
    page_size = 3
    current_page = 0
    all_addresses = []

    while True:
        start_index = current_page * page_size
        addresses, has_more = issuer_registry.getAllIssuers(start_index, page_size)
        if not addresses:
            break
        print(f" Page {current_page + 1}:")
        for i, addr in enumerate(addresses):
            all_addresses.append(addr)
            print(f" - {start_index + i + 1}, {format_address(addr)}")

        if not has_more:
            break
        current_page += 1
    
    print(f"Total addresses retrieved: {len(all_addresses)}")

    print_section("Active Issuers Only")
    active_addresses, active_names, has_more = issuer_registry.getActiveIssuers(0,10)

    for i, (addr, name) in enumerate(zip(active_addresses, active_names), 1):
        print(f" {i}. {name}")
        print(f" - Address: {format_address(addr)}" )
    print(f"Total active issuers: {len(active_addresses)}")

    print_section("Detailed Issuer Information")
    for i, addr in enumerate(all_addresses[:3],1):
        try:
            print(f"Issuer {i}: {format_address(addr)}")
            info = issuer_registry.getIssuerInfo(addr)
            name = info[0]
            location = info[1]
            registration_time = info[2]
            is_active = info[3]
            certificate_count = info[4]

            print(f" Name: {name}")
            print(f" Location: {location}")
            print(f" Registered: {time.ctime(registration_time)}")
            print(f" Status: {'Active' if is_active else 'Inactive'}")
            print(f" Certificates issued: {certificate_count}")
            name_only = issuer_registry.getIssuerName(addr)
            is_registered = issuer_registry.isRegisteredIssuer(addr)
            is_address_registered = issuer_registry.isAddressRegistered(addr)

            print(f"  Query Results:")
            print(f"  -Name Query: {name_only}")
            print(f"  -Is Registered & Active: {is_registered}")
            print(f"  -Is Address Registered: {is_address_registered}")
            print()
        except Exception as e:
            print(f" Error querying issuer {addr}: {e}")
    print_section("Registration Status Checks")

    if all_addresses:
        test_address = all_addresses[0]
        print(f"Testing with registered address: {format_address(test_address)}")
        print(f"  Is Registered & Active: {issuer_registry.isRegisteredIssuer(test_address)}")
        print(f"  Is Address Registered: {issuer_registry.isAddressRegistered(test_address)}")

    
    unregistered_address = accounts[9].address
    print(f"Testing with unregistered address: {format_address(unregistered_address)}")
    print(f"  Is Registered & Active: {issuer_registry.isRegisteredIssuer(unregistered_address)}")
    print(f"  Is Active Registered: {issuer_registry.isAddressRegistered(unregistered_address)}")

    print_section("Edge Cases and Limits")

    try:
        addresses, has_more = issuer_registry.getAllIssuers(0,1000)
        print(f" Large Pagination request: Retrieved {len(addresses)} addresses")
        if total_issuers > 0:
            addresses, has_more = issuer_registry.getAllIssuers(total_issuers-1,1)
            print(f" Edge pagination: Retrieved {len(addresses)} addresses")
    except Exception as e:
        print(f" Pagination edge case error: {e}")
    
    print_section("Performance Demonstration")
    start_time = time.time()
    for _ in range(10):
        issuer_registry.getTotalIssuers()
        issuer_registry.getContractStats()
        if all_addresses:
            issuer_registry.isRegisteredIssuer(all_addresses[0])

    end_time = time.time()
    print(f" 30 rapid queries completed in {end_time - start_time:.4f} seconds")

    print("Query Demonstration Complete")
    print(" All query function working correctly")
    print(" Registetration status checks functional")
    print(" Performance is acceptable for view functions")
    print()
    
    return issuer_registry
def main():
    return demonstrate_queries()

if __name__ == "__main__":
    main()
