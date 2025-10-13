from app import create_app

app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("Certificate Verification Backend - Local Development")
    print("=" * 60)
    print("Server: http://127.0.0.1:5000")
    print("React should run on: http://localhost:3000")
    print("=" * 60)
    
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True
    )