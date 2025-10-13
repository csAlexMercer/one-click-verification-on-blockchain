import hashlib
from werkzeug.datastructures import FileStorage
import PyPDF2
import logging

logger = logging.getLogger(__name__)

class PDFHandler:
    MAX_FILE_SIZE = 16*1024*1024

    @staticmethod
    def validate_pdf(file: FileStorage) -> tuple[bool, str]:
        if not file or file.filename == '':
            return False, "No File Provided"
        if not file.filename.lower().endswith('.pdf'):
            return False, "File must be PDF"
        
        file.seek(0,2)
        size = file.tell()
        file.seek(0)

        if size > PDFHandler.MAX_FILE_SIZE:
            return False, f"File too large (max 16MB)"
        if size == 0:
            return False, "File is empty"
        
        try:
            pdf = pyPDF2.PDFReader(file)
            if len(pdf.pages) == 0:
                return False, "PDF has no pages"
            file.seek(0)
        except:
            return False, "Invalid PDF file"
        
        return True, ""
    
    @staticmethod
    def calculate_hash(File: FileStorage) -> str:
        try:
            content = file.read()
            file.seek(0)
            hash_obj = hashlib.sha256(content)
            return hash_obj.hexdigest()
        except Exception as e:
            logger.error(f"Hash calculation error: {e}")
            raise
    
    @staticmethod
    def hash_to_bytes(hash_str:str) -> bytes:
        if hash_str.startswith('0x'):
            hash_str = hash_str[2:]
        return bytes.fromhex(hash_str)
    
    @staticmethod
    def bytes_to_hash(hash_bytes: bytes) -> str:
        return '0x' + hash_bytes.hex()
    
_handler = PDFHandler()

def get_pdf_handler():
    return _handler