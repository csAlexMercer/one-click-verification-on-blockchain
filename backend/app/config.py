import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
class Config:
    SECRET_KEY = 'dev-secret-key'
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000']
    UPLOAD_FOLDER = BASE_DIR /'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf'}

    WEB3_PROVIDER_URI = os.getenv('WEB3_PROVIDER_URI', 'http://127.0.0.1:8545')
    NETWORK_ID = 1337

    ISSUER_REGISTRY_ADDRESS = os.getenv('ISSUER_REGISTRY_ADDRESS', '')
    CERTIFICATE_STORE_ADDRESS = os.getenv('CERTIFICATE_STORE_ADDRESS', '')

    DEPLOYER_ADDRESS = os.getenv('DEPLOYER_ADDRESS','')
    DEPLOYER_PRIVATE_KEY = os.getenv('DEPLOYER_PRIVATE_KEY', '')

def get_config():
    return Config