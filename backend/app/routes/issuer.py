from flask import Blueprint, request, jsonify
from app.services.blockchain import get_blockchain_service
from web3 import Web3
import logging
import json
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)
bp = Blueprint('issuer', __name__)

# Pending registrations storage (file-based)
PENDING_FILE = Path(__file__).resolve().parent.parent / 'data' / 'pending_registrations.json'

def get_pending_registrations():
    if not PENDING_FILE.exists():
        return {}
    try:
        with open(PENDING_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_pending_registrations(pending):
    PENDING_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PENDING_FILE, 'w') as f:
        json.dump(pending, f, indent=2)

def add_pending_registration(issuer_address, name, location, email):
    pending = get_pending_registrations()
    pending[issuer_address.lower()] = {
        'issuer_address': issuer_address,
        'name': name,
        'location': location,
        'email': email,
        'submitted_at': datetime.now().isoformat(),
        'status': 'pending'
    }
    save_pending_registrations(pending)

def remove_pending_registration(issuer_address):
    pending = get_pending_registrations()
    if issuer_address.lower() in pending:
        del pending[issuer_address.lower()]
        save_pending_registrations(pending)

@bp.route('/register', methods=['POST'])
def register_issuer():
    try:
        data = request.get_json()
        issuer_address = data.get('issuer_address')
        name = data.get('name')
        location = data.get('location')
        email = data.get('email', '')

        if not all([issuer_address, name, location]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400

        if not Web3.is_address(issuer_address):
            return jsonify({
                'success': False,
                'message': 'Invalid issuer_address'
            }), 400

        issuer_address = Web3.to_checksum_address(issuer_address)
        blockchain = get_blockchain_service()
        
        # Check if already registered on blockchain
        if blockchain.is_registered_issuer(issuer_address):
            return jsonify({
                'success': False,
                'message': 'Issuer already registered'
            }), 400
        
        # Check if already pending
        pending = get_pending_registrations()
        if issuer_address.lower() in pending:
            return jsonify({
                'success': False,
                'message': 'Registration request already pending'
            }), 400
        
        # Add to pending registrations (awaiting admin approval)
        add_pending_registration(issuer_address, name, location, email)
        
        return jsonify({
            'success': True,
            'message': 'Registration request submitted! Awaiting admin approval.'
        }), 201
    except ValueError as e:
        logger.error(f"Registration validation error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/pending', methods=['GET'])
def get_pending_registrations_route():
    try:
        pending = get_pending_registrations()
        pending_list = list(pending.values())
        return jsonify({'success': True, 'data': pending_list}), 200
    except Exception as e:
        logger.error(f"Error getting pending registrations: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/approve/<address>', methods=['POST'])
def approve_issuer(address):
    try:
        if not Web3.is_address(address):
            return jsonify({
                'success': False,
                'message': 'Invalid address'
            }), 400
        
        address = Web3.to_checksum_address(address)
        pending = get_pending_registrations()
        
        if address.lower() not in pending:
            return jsonify({
                'success': False,
                'message': 'No pending registration found for this address'
            }), 404
        
        pending_reg = pending[address.lower()]
        blockchain = get_blockchain_service()
        
        # Register on blockchain
        result = blockchain.register_issuer_admin(address, pending_reg['name'], pending_reg['location'])
        if result['success']:
            # Remove from pending
            remove_pending_registration(address)
            
            return jsonify({
                'success': True,
                'data': {'transaction_hash': result['transaction_hash'], 'gas_used': result['gas_used']},
                'message': 'Issuer approved and registered successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to register issuer on blockchain'
            }), 500
    except Exception as e:
        logger.error(f"Approval error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/active', methods=['GET'])
def get_active_issuers():
    try:
        blockchain = get_blockchain_service()
        issuers = blockchain.get_active_issuers()
        return  jsonify({'success': True, 'data': issuers}), 200
    except Exception as e:
        logger.error(f"Error getting issuers: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/check/<address>', methods=['GET'])
def check_issuer(address):
    try:
        blockchain = get_blockchain_service()
        is_registered = blockchain.is_registered_issuer(address)
        info = None
        if is_registered:
            info = blockchain.get_issuer_info(address)
        return jsonify({
            'success': True,
            'data': {'is_registered': is_registered, 'info': info}
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500