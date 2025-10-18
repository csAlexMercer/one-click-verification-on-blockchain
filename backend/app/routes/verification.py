from flask import Blueprint, request, jsonify
from app.services.blockchain import get_blockchain_service
from app.services.pdf_handler import get_pdf_handler
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('verification', __name__)

@bp.route('/file', methods=['POST'])
def verify_by_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
        file = request.files['file']
        pdf_handler = get_pdf_handler()
        is_valid, error = pdf_handler.validate_pdf(file)
        if not is_valid:
            return jsonify({'success': False, 'message': error}), 400
        hash_hex = pdf_handler.calculate_hash(file)
        hash_bytes = pdf_handler.hash_to_bytes(hash_hex)
        blockchain = get_blockchain_service()
        verification = blockchain.verify_certificate(hash_bytes)

        if verification['is_valid']:
            status = 'REVOKED' if verification['is_revoked'] else 'ACTIVE'
            message = f"Certificate is {status}"
            return jsonify({
                'success': True,
                'data': {
                    'is_valid': not verification['is_revoked'],
                    'certificate_hash': '0x' + hash_hex,
                    'issuer_name': verification['issuer_name'],
                    'issuer': verification['issuer'],
                    'recipient': verification['recipient'],
                    'issuance_time': verification['issuance_time'],
                    'is_revoked': verification['is_revoked'],
                    'status': status
                },
                'message': message
            }), 200
        else:
            return jsonify({
                'success': True,
                'data': {'is_valid': False,
                         'certificate_hash': '0x' + hash_hex,
                         'status': 'NOT_FOUND'},
                'message': 'Certificate NOT FOUND - Never Issued'
            }), 200
    except Exception as e:
        logger.error(f"Verification error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    
@bp.route('/hash', methods=['POST'])
def verify_by_hash():
    try:
        data = request.get_json()
        hash_Str = data.get('hash')
        
        if not hash_Str:
            return jsonify({
                'success': False,
                'message': 'Hash required'
            }), 400
        pdf_handler = get_pdf_handler()
        hash_bytes = pdf_handler.hash_to_bytes(hash_Str)
        blockchain = get_blockchain_service()
        verification = blockchain.verify_certificate(hash_bytes)
        if verification['is_valid']:
            status = 'REVOKED' if verification['is_revoked'] else 'ACTIVE'

            return jsonify({
                'success': True,
                'data': {
                    'is_valid': not verification['is_revoked'],
                    'issuer_name': verification['issuer_name'],
                    'status': status,
                    **verification
                }
            }), 200
        else:
            return jsonify({
                'success': True,
                'data': {'is_valid': False, 'status': 'NOT_FOUND'}
            }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
