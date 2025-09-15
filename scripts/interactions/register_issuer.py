from brownie import network, IssuerRegistry
from scripts.help_scripts import (create_sample_institution_data, get_account,load_deployment_info, print_section)

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
