from web3 import Web3
import json
from pathlib import Path
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class BlockchainService:
    def __init__(self):
        self.w3 = None
        self.issuer_registry = None
        self.certificate_store = None
        self._initialize()
    
    def _initialize(self):
        try:
            provider_uri = current_app.config['WEB3_PROVIDER_URI']
            self.w3 = Web3(Web3.HTTPProvider(provider_uri))
            if not self.w3.is_connected():
                raise ConnectionError(f"Cannot connect to {provider_uri}")
            logger.info(f"Connected to Ganache at {provider_uri}")
            self._load_contracts()
        
        except Exception as e:
            logger.error(f"Blockchain initialization failed: {e}")
            raise

    def _to_checksum_address(self, address: str, field_name: str) -> str:
        if not address or not isinstance(address, str) or not Web3.is_address(address):
            raise ValueError(f"Invalid or missing {field_name}")
        return Web3.to_checksum_address(address)

    def _load_contracts(self):
        build_dir = Path(current_app.root_path).parent.parent / 'build' / 'contracts'
        issuer_address = current_app.config['ISSUER_REGISTRY_ADDRESS']
        cert_address = current_app.config['CERTIFICATE_STORE_ADDRESS']

        with open(build_dir / 'IssuerRegistry.json', 'r') as f:
            issuer_abi = json.load(f)['abi']
        with open(build_dir / 'CertificateStore.json', 'r') as f:
            cert_abi = json.load(f)['abi']

        self.issuer_registry = self.w3.eth.contract(
            address=self._to_checksum_address(issuer_address, 'issuer registry contract address'), abi=issuer_abi
        )
        self.certificate_store = self.w3.eth.contract(
            address=self._to_checksum_address(cert_address, 'certificate store contract address'), abi=cert_abi
        )
        logger.info("Contract loaded successfully")
    
    def register_issuer_admin(self, issuer_address:str, name:str,location:str) -> dict:
        try:
            deployer = current_app.config['DEPLOYER_ADDRESS']
            private_key = current_app.config['DEPLOYER_PRIVATE_KEY']
            if not private_key:
                raise ValueError('Missing DEPLOYER_PRIVATE_KEY in environment')

            issuer_checksum = self._to_checksum_address(issuer_address, 'issuer_address')
            deployer_checksum = self._to_checksum_address(deployer, 'DEPLOYER_ADDRESS')

            txn = self.issuer_registry.functions.registerIssuer(
                issuer_checksum, name, location
            ).build_transaction({
                'from': deployer_checksum,
                'nonce': self.w3.eth.get_transaction_count(deployer_checksum),
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price
            })
            signed = self.w3.eth.account.sign_transaction(txn, private_key)
            raw_transaction = getattr(signed, 'rawTransaction', getattr(signed, 'raw_transaction', None))
            if raw_transaction is None:
                raise AttributeError('Signed transaction missing raw transaction payload')
            tx_hash = self.w3.eth.send_raw_transaction(raw_transaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            return{
                'success': receipt['status'] == 1,
                'transaction_hash': tx_hash.hex(),
                'gas_used': receipt['gasUsed']
            }
        except Exception as e:
            logger.error(f"Error registering issuer: {e}")
            raise
    def get_active_issuers(self) -> list:
        try:
            addresses, names, _ = self.issuer_registry.functions.getActiveIssuers(0,50).call()
            return [{'address': addr, 'name': name} for addr, name in zip(addresses, names)]
        except Exception as e:
            logger.error(f"Error getting issuers: {e}")
            return []
    
    def is_registered_issuer(self, address: str) -> bool:
        try:
            return self.issuer_registry.functions.isRegisteredIssuer(Web3.to_checksum_address(address)).call()
        except Exception as e:
            return False
    
    def get_issuer_info(self, address: str) -> dict:
        try:
            info = self.issuer_registry.functions.getIssuerInfo(Web3.to_checksum_address(address)).call()
            return {
                'name': info[0],
                'location': info[1],
                'registration_time': info[2],
                'is_active': info[3],
                'total_certificate': info[4]
            }
        except Exception as e:
            logger.error(f"Error getting issuer info: {e}")
            raise
    
    def verify_certificate(self, cert_hash:bytes) -> dict:
        try:
            result = self.certificate_store.functions.verifyCertificate(cert_hash).call()
            return{
                'is_valid': result[0],
                'issuer': result[1],
                'recipient': result[2],
                'issuance_time': result[3],
                'is_revoked': result[4],
                'issuer_name': result[5]
            }
        except Exception as e:
            logger.error(f"Error verifying certificate: {e}")
            raise

    def get_certificate_details(self, cert_hash: bytes) -> dict:
        try:
            details = self.certificate_store.functions.getCertificateDetails(cert_hash).call()
            return {
                'certificate_hash': details[0],
                'issuer': details[1],
                'recipient': details[2],
                'issuance_time': details[3],
                'is_revoked': details[4],
                'revocation_time': details[5]
            }
        except Exception as e:
            logger.error(f"Error getting certificate details: {e}")
            raise
    
    def get_certificates_for_recipient(self, recipient_address: str) -> list:
        try:
            hashes, _ = self.certificate_store.functions.getCertificatesForRecipient(Web3.to_checksum_address(recipient_address), 0, 100).call()
            certificates = []
            for cert_hash in hashes:
                verification = self.verify_certificate(cert_hash)
                certificates.append({
                    'hash': '0x' + cert_hash.hex(),
                    'issuer_name': verification['issuer_name'],
                    'issuance_time': verification['issuance_time'],
                    'is_revoked': verification['is_revoked']
                })
            return certificates
        except Exception as e:
            logger.error(f"Error getting recipient certificates: {e}")
            return []
    
    def get_contract_stats(self) -> dict:
        try:
            issuer_stats = self.issuer_registry.functions.getContractStats().call()
            cert_stats = self.certificate_store.functions.getContractStats().call()

            return {
                'total_issuers': issuer_stats[0],
                'active_issuers': issuer_stats[1],
                'total_certificates': cert_stats[0],
                'total_revoked': cert_stats[1]
            }
        except:
            return {}

_service = None

def get_blockchain_service():
    global _service
    if _service is None:
        _service = BlockchainService()
    return _service