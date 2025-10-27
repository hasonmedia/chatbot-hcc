"""
File Processor Helper
Xử lý đọc nội dung từ các file PDF, WORD, Excel
"""
import os
import logging
from typing import Dict, Optional
from pypdf import PdfReader
from docx import Document
from openpyxl import load_workbook

logger = logging.getLogger(__name__)


class FileProcessor:
    """Class xử lý đọc nội dung từ các loại file khác nhau"""
    
    SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.xlsx', '.xls'}
    
    @staticmethod
    def is_supported_file(filename: str) -> bool:
        """Kiểm tra xem file có được hỗ trợ không"""
        ext = os.path.splitext(filename)[1].lower()
        return ext in FileProcessor.SUPPORTED_EXTENSIONS
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Dict[str, any]:
        """
        Đọc nội dung từ file PDF
        
        Args:
            file_path: Đường dẫn đến file PDF
            
        Returns:
            Dict chứa content và metadata
        """
        try:
            reader = PdfReader(file_path)
            text_content = []
            
            # Đọc từng trang
            for page_num, page in enumerate(reader.pages, 1):
                text = page.extract_text()
                if text.strip():
                    text_content.append(f"[Trang {page_num}]\n{text}")
            
            full_text = "\n\n".join(text_content)
            
            # Lấy metadata
            metadata = {
                'num_pages': len(reader.pages),
                'file_type': 'PDF'
            }
            
            if reader.metadata:
                metadata.update({
                    'title': reader.metadata.get('/Title', ''),
                    'author': reader.metadata.get('/Author', ''),
                    'subject': reader.metadata.get('/Subject', ''),
                })
            
            return {
                'success': True,
                'content': full_text,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Lỗi đọc file PDF: {str(e)}")
            return {
                'success': False,
                'content': '',
                'error': str(e)
            }
    
    @staticmethod
    def extract_text_from_docx(file_path: str) -> Dict[str, any]:
        """
        Đọc nội dung từ file DOCX
        
        Args:
            file_path: Đường dẫn đến file DOCX
            
        Returns:
            Dict chứa content và metadata
        """
        try:
            doc = Document(file_path)
            text_content = []
            
            # Đọc các đoạn văn
            for para in doc.paragraphs:
                if para.text.strip():
                    text_content.append(para.text)
            
            # Đọc nội dung trong bảng
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells])
                    if row_text.strip():
                        text_content.append(row_text)
            
            full_text = "\n\n".join(text_content)
            
            # Metadata
            metadata = {
                'num_paragraphs': len(doc.paragraphs),
                'num_tables': len(doc.tables),
                'file_type': 'DOCX'
            }
            
            # Thêm core properties nếu có
            if doc.core_properties:
                metadata.update({
                    'title': doc.core_properties.title or '',
                    'author': doc.core_properties.author or '',
                    'subject': doc.core_properties.subject or '',
                })
            
            return {
                'success': True,
                'content': full_text,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Lỗi đọc file DOCX: {str(e)}")
            return {
                'success': False,
                'content': '',
                'error': str(e)
            }
    
    @staticmethod
    def extract_text_from_excel(file_path: str) -> Dict[str, any]:
        """
        Đọc nội dung từ file Excel
        
        Args:
            file_path: Đường dẫn đến file Excel
            
        Returns:
            Dict chứa content và metadata
        """
        try:
            wb = load_workbook(file_path, data_only=True)
            text_content = []
            
            # Đọc từng sheet
            for sheet_name in wb.sheetnames:
                sheet = wb[sheet_name]
                text_content.append(f"[Sheet: {sheet_name}]")
                
                # Đọc từng hàng
                for row in sheet.iter_rows(values_only=True):
                    # Lọc bỏ các ô None và chuyển thành string
                    row_text = " | ".join([str(cell) for cell in row if cell is not None])
                    if row_text.strip():
                        text_content.append(row_text)
                
                text_content.append("")  # Thêm dòng trống giữa các sheet
            
            full_text = "\n".join(text_content)
            
            # Metadata
            metadata = {
                'num_sheets': len(wb.sheetnames),
                'sheet_names': wb.sheetnames,
                'file_type': 'Excel'
            }
            
            # Thêm properties nếu có
            if wb.properties:
                metadata.update({
                    'title': wb.properties.title or '',
                    'creator': wb.properties.creator or '',
                    'subject': wb.properties.subject or '',
                })
            
            wb.close()
            
            return {
                'success': True,
                'content': full_text,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Lỗi đọc file Excel: {str(e)}")
            return {
                'success': False,
                'content': '',
                'error': str(e)
            }
    
    @classmethod
    def process_file(cls, file_path: str, filename: str) -> Dict[str, any]:
        """
        Xử lý file dựa trên extension
        
        Args:
            file_path: Đường dẫn đến file
            filename: Tên file gốc
            
        Returns:
            Dict chứa content và metadata
        """
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == '.pdf':
            result = cls.extract_text_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            result = cls.extract_text_from_docx(file_path)
        elif ext in ['.xlsx', '.xls']:
            result = cls.extract_text_from_excel(file_path)
        else:
            return {
                'success': False,
                'content': '',
                'error': f'Định dạng file không được hỗ trợ: {ext}'
            }
        
        # Thêm tên file vào metadata
        if result.get('success'):
            result['metadata']['filename'] = filename
            result['metadata']['file_extension'] = ext
        
        return result


def process_uploaded_file(file_path: str, filename: str) -> Dict[str, any]:
    """
    Function wrapper để xử lý file upload
    
    Args:
        file_path: Đường dẫn đến file đã upload
        filename: Tên file gốc
        
    Returns:
        Dict chứa content và metadata
    """
    return FileProcessor.process_file(file_path, filename)
