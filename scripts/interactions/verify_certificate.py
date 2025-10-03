
import time
def get_verify_input():
    print("\nEnter Certificate Information to verif7:")
    print("="*60)
    hash_input = input("Enter certificate hash: ").strip()
    if hash_input.startswith('0x'):
        hash_input = hash_input[2:]
    if len(hash_input) != 64:
        print(f"Invalid hash length: {len(hash_input)}")
        return None, 'hash'
    try:
        cert_hash = bytes.fromhex(hash_input)
        print(f"Hash accepted: {hash_input}")
        return cert_hash, 'hash'
    except ValueError:
        print("Invalid hash format")
        return None, 'hash'
    
def verify_by_hash(certificate_store, issuer_registry, cert_hash):
    print(f"Verifying certificate...")
    print()
    try:
        verification = certificate_store.verifyCertificate(cert_hash)
        is_valid = verification[0]
        issuer = verification[1]
        recipient = verification[2]
        issuance_time = verification[3]
        is_revoked = verification[4]
        issuer_name = verification[5]

        if not is_valid:
            print("VERIFICATION FAILED!!!")
            print("WARNING: This certificate should not be trusted.")
            return False
        print("CERIFICATE FOUND")
        print("=" * 60)
        print()
        print("Certificate Information: ")
        print(f" Certificate Hash: 0x{cert_hash.hex()}")
        print(f" Issuer institution: {issuer_name}")
        print(f" Issuer Address: {issuer}")
        print(f" Certiicate holder address: {recipient}")
        print(f" Issued on: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(issuance_time))}")
        print(f" Timestamp: {issuance_time}")
        print()

        if is_revoked:
            print(" Status: REVOKED")
            print(" This certificate has been REVOKED and is NO LONGER VALID")
            