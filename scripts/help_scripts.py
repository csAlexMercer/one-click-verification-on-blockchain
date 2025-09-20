from brownie import accounts, network, config, Wei
import hashlib
from datetime import datetime
import json
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
DEPLOYMENTS_DIR = PROJECT_ROOT / "deployments"

def get_account(index = 0):
    if network.show_active() == "development":
        return accounts[index]
    else:
        return accounts.add(config["wallets"]["from_key"])

def generate_certificate_hash(content):
    if isinstance(content, str):
        content = content.encode('utf-8')
    return hashlib.sha256(content).hexdigest()

def format_address(address):
    return f"{address[:6]}...{address[-4]}"

def format_Wei_to_ether(wei_amount):
    return f"{Wei(wei_amount).to('ether'):.4f} ETH"

def print_transaction_details(tx):
    print(f"Transaction Hash: {tx.txid}")
    print(f"Gas Used: {tx.gas_used:,}")
    print(f"Gas Price: {tx.gas_price / 1e9:.2f} Gwei")
    print(f"Transaction Cost: {format_Wei_to_ether(tx.gas_used * tx.gas_price)}")

def create_sample_institution_data():
    institutions = [
        {"name": "Chhatrapati Shahu Ji Maharaj University Kanpur",
         "location": "Kanpur, Uttar Pradesh, India",
         "address": accounts[1].address},
        {"name": "Indian Institute of Technology Kanpur",
         "location": "Kanpur, Uttar Pradesh, India",
         "address": accounts[2].address},
        {"name": "Dr. A.P.J. Abdul Kalam Technical University",
         "location": "Lucknow, Uttar Pradesh, India",
         "address": accounts[3].address},
        {"name": "Delhi University",
         "location": "Delhi, India",
         "address": accounts[4].address},
        {"name": "Banaras Hindu University",
         "location": "Varanasi, Uttar Pradesh, India",
         "address": accounts[5].address}
    ]
    return institutions

def create_sample_certificate():
    certificates = [
        {"content": "Bachelor in Computer Application",
         "recipient": accounts[6].address,
         "issuer_index":1},
        {"content": "Master in Computer Application",
         "recipient": accounts[7].address,
         "issuer_index":2}
    ]
    for cert in certificates:
        cert["hash"] = generate_certificate_hash(cert["content"])

    return certificates

def save_deployment_info(contract_name, contract_address, network_name):
    deployment_info = {
        "contract_name": contract_name,
        "address": contract_address,
        "network": network_name,
        "deployed_at": datetime.now().isoformat(),
        "deployer": get_account().address
    }
    DEPLOYMENTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{network_name}_{contract_name.lower()}.json"
    filepath = DEPLOYMENTS_DIR / filename

    with open(filepath, 'w') as f:
        json.dump(deployment_info, f, indent=2)
    
    print(f"Deployment info saved")

def load_deployment_info(contract_name, network_name):
    filename = f"{network_name}_{contract_name.lower()}.json"
    filepath = DEPLOYMENTS_DIR / filename
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"No deployment info found for {contract_name}_{contract_name.lower()}")
        return None

def print_section(title):
    print(f"\n📋 {title}")
    print("-" * 40)


def verify_network():
    print_section("Network Information")
    print(f"Active Network: {network.show_active()}")
    print(f"Chain ID: {network.chain.id}")
    if network.show_active() == "development":
        print(f"Available Accounts: {len(accounts)}")
        print(f"Default Account: {accounts[0].address}")
        print(f"Account Balance: {format_Wei_to_ether(accounts[0].balance())}")

    return True
