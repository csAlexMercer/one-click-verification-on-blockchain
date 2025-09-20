from brownie import network, IssuerRegistry
from scripts.help_scripts import (format_address, print_section,load_deployment_info)

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
    for i, addr in enumerate(all_addresses)
