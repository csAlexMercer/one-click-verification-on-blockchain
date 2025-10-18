from flask import Flask, jsonify
from flask_cors import CORS
from pathlib import Path
import logging

from app.config import get_config

def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())
    Path(app.config['UPLOAD_FOLDER']).mkdir(parents=True, exist_ok=True)

    CORS(app, resources={
        r"/api/*":{
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["content-Type"]
        }
    })

    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] %(levelname)s: %(message)s'
    )

    from app.routes import issuer, certificate, verification

    app.register_blueprint(issuer.bp, url_prefix='/api/issuer')
    app.register_blueprint(certificate.bp, url_prefix='/api/certificate')
    app.register_blueprint(verification.bp, url_prefix='/api/verify')

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Not Found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Error: {error}')
        return jsonify({'success': False, 'message': 'Internal error'}), 500
    
    @app.route('/api/health')
    def health():
        from app.services.blockchain import get_blockchain_service
        try:
            bc = get_blockchain_service()
            return jsonify({'status': 'healthy', 'blockchain_connected': bc.w3.is_connected()})
        except:
            return jsonify({'status': 'unhealthy'}), 503
    return app
