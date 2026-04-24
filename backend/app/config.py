import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _split_csv_env(name, default):
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(',') if item.strip()]


class Config:
    SECRET_KEY = os.environ['SECRET_KEY']
    DEBUG = True
    CORS_ORIGINS = _split_csv_env('CORS_ORIGINS', [])
    UPLOAD_FOLDER = BASE_DIR /'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf'}

    WEB3_PROVIDER_URI = os.environ['WEB3_PROVIDER_URI']
    NETWORK_ID = int(os.environ['NETWORK_ID'])

    ISSUER_REGISTRY_ADDRESS = os.environ['ISSUER_REGISTRY_ADDRESS']
    CERTIFICATE_STORE_ADDRESS = os.environ['CERTIFICATE_STORE_ADDRESS']

    DEPLOYER_ADDRESS = os.environ['DEPLOYER_ADDRESS']
    DEPLOYER_PRIVATE_KEY = os.environ['DEPLOYER_PRIVATE_KEY']

def get_config():
    return Config