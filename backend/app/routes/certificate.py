from flask import Blueprint, request, jsonify
from app.services.blockchain import get_blockchain_service
from app.services.pdf_handler import get_pdf_handler
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('certificate', __name__)

@bp.route('/calculate-hash', methods=['POST'])
def calculate_hash():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
        
        file = request.files['file']
        pdf_handler = get_pdf_handler()
        is_valid, error = pdf_handler.validate_pdf(file)
        if not is_valid:
            return jsonify({'success': False, 'message': error}), 400
        
        hash_hex = pdf_handler.calculate_hash(file)
        return jsonify({'success': True,
                        'data': {'hash': hash_hex, 'hash_with_prefix': '0x' + hash_hex},
                        'message': 'Hash calculated successfully'}), 200
    
    except Exception as e:
        logger.error(f"Hash calculation error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/recipient/<address>', methods=['GET'])
def get_recipient_certificates(address):
    try:
        blockchain = get_blockchain_service()
        certificates = blockchain.get_certificates_for_recipient(address)
        return jsonify({
            'success': True,
            'data': {'certificates': certificates, 'count': len(certificates)}
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting certificates: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    
@bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        blockchain = get_blockchain_service()
        stats = blockchain.get_contract_stats()
        return jsonify({'success': True, 'data': stats}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500