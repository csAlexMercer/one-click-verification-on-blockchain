from flask import Blueprint, request, jsonify
from app.services.blockchain import get_blockchain_service
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('issuer', __name__)

@bp.route('/register', methods=['POST'])
def register_issuer():
    try:
        data = request.get_json()
        issuer_address = data.get('issuer_address')
        name = data.get('name')
        location = data.get('location')

        if not all([issuer_address, name, location]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        blockchain = get_blockchain_service
        if blockchain.is_registered_issuer(issuer_address):
            return jsonify({
                'success': False,
                'message': 'Issuer already registered'
            }), 400
        
        result = blockchain.register_issuer_admin(issuer_address, name, location)
        if result['success']:
            return jsonify({
                'success': True,
                'data': {'transaction_hash': result['transaction_hash'], 'gas_used': result['gas_used']},
                'message': 'Issuer registered successfully'
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Registration failed'
            }), 500
    except Exception as e:
        logger.error(f"Registration error: {e}")
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