"""
File Processor Helper
Xử lý đọc nội dung từ các file PDF, WORD, Excel và chunk vào database
"""
import os
import logging
from typing import Dict, Optional
from langchain_community.document_loaders import (
    UnstructuredExcelLoader,
    PyPDFLoader,
    Docx2txtLoader  # Loader đơn giản hơn, không cần internet
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config.get_embedding import get_embedding_gemini
from models.knowledge_base import DocumentChunk
from config.database import AsyncSessionLocal
from sqlalchemy import delete, select

logger = logging.getLogger(__name__)


async def insert_chunks_to_db(chunks_data: list):
    """
    Insert chunks vào database
    
    Args:
        chunks_data: List của dict chứa chunk_text, search_vector, knowledge_base_detail_id
    """
    async with AsyncSessionLocal() as session:
        try:
            for d in chunks_data:
                chunk = DocumentChunk(
                    chunk_text=str(d['chunk_text']),
                    search_vector=d.get('search_vector'), 
                    knowledge_base_detail_id=d['knowledge_base_detail_id']
                )
                session.add(chunk)
                await session.commit()
            logger.info(f"Đã insert {len(chunks_data)} chunks vào database")
        except Exception as e:
            logger.error(f"Lỗi insert chunks: {str(e)}")
            await session.rollback()
            raise


async def delete_chunks_by_detail_id(detail_id: int):
    """
    Xóa tất cả chunks liên quan đến một knowledge_base_detail_id
    
    Args:
        detail_id: ID của knowledge_base_detail
    """
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(
                delete(DocumentChunk).where(DocumentChunk.knowledge_base_detail_id == detail_id)
            )
            await session.commit()
            logger.info(f"Đã xóa tất cả chunks của detail_id={detail_id}")
            return True
        except Exception as e:
            logger.error(f"Lỗi xóa chunks: {str(e)}")
            await session.rollback()
            return False


class FileProcessor:
    """Class xử lý đọc nội dung từ các loại file khác nhau sử dụng Langchain loaders"""
    
    SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.xlsx', '.xls'}
    
    # Cấu hình chunking
    CHUNK_SIZE = 1500
    CHUNK_OVERLAP = 200
    
    @staticmethod
    def is_supported_file(filename: str) -> bool:
        """Kiểm tra xem file có được hỗ trợ không"""
        ext = os.path.splitext(filename)[1].lower()
        return ext in FileProcessor.SUPPORTED_EXTENSIONS
    
    @staticmethod
    async def extract_text_from_pdf(file_path: str) -> Dict[str, any]:
        """
        Đọc nội dung từ file PDF sử dụng PyPDFLoader
        
        Args:
            file_path: Đường dẫn đến file PDF
            
        Returns:
            Dict chứa content và metadata
        """
        try:
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            
            # Kết hợp nội dung từ tất cả các trang
            full_text = "\n\n".join([doc.page_content for doc in documents])
            
            # Metadata
            metadata = {
                'num_pages': len(documents),
                'file_type': 'PDF'
            }
            
            if documents and documents[0].metadata:
                metadata.update({
                    'source': documents[0].metadata.get('source', ''),
                })
            
            return {
                'success': True,
                'content': full_text,
                'metadata': metadata,
                'documents': documents  # Để chunk sau
            }
            
        except Exception as e:
            logger.error(f"Lỗi đọc file PDF: {str(e)}")
            return {
                'success': False,
                'content': '',
                'error': str(e)
            }
    
    @staticmethod
    async def extract_text_from_docx(file_path: str) -> Dict[str, any]:
        """
        Đọc nội dung từ file DOCX sử dụng Docx2txtLoader
        (Fallback sang python-docx nếu Docx2txtLoader lỗi)
        
        Args:
            file_path: Đường dẫn đến file DOCX
            
        Returns:
            Dict chứa content và metadata
        """
        try:
            # Thử dùng Docx2txtLoader trước (đơn giản, không cần internet)
            try:
                loader = Docx2txtLoader(file_path)
                documents = loader.load()
                
                # Kết hợp nội dung
                full_text = "\n\n".join([doc.page_content for doc in documents])
                
                # Metadata
                metadata = {
                    'num_elements': len(documents),
                    'file_type': 'DOCX'
                }
                
                if documents and documents[0].metadata:
                    metadata.update({
                        'source': documents[0].metadata.get('source', ''),
                    })
                
                return {
                    'success': True,
                    'content': full_text,
                    'metadata': metadata,
                    'documents': documents
                }
            except Exception as e:
                logger.warning(f"Docx2txtLoader failed: {str(e)}, trying python-docx...")
                # Fallback sang python-docx
                raise
                
        except Exception as e:
            # Fallback: Dùng python-docx trực tiếp
            try:
                from docx import Document
                
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
                
                logger.info(f"✅ Đã đọc DOCX bằng python-docx fallback")
                return {
                    'success': True,
                    'content': full_text,
                    'metadata': metadata
                }
            except Exception as e2:
                logger.error(f"Lỗi đọc file DOCX (cả 2 methods): {str(e2)}")
                return {
                    'success': False,
                    'content': '',
                    'error': str(e2)
                }
    
    @staticmethod
    async def extract_text_from_excel(file_path: str) -> Dict[str, any]:
        """
        Đọc nội dung từ file Excel sử dụng pandas để giữ nguyên cấu trúc bảng
        Mỗi sheet sẽ được chuyển thành text có header
        
        Args:
            file_path: Đường dẫn đến file Excel
            
        Returns:
            Dict chứa content và metadata
        """
        try:
            import pandas as pd
            
            # Đọc tất cả các sheet
            excel_file = pd.ExcelFile(file_path)
            sheet_contents = []
            total_rows = 0
            
            for sheet_name in excel_file.sheet_names:
                try:
                    # Đọc sheet
                    df = pd.read_excel(file_path, sheet_name=sheet_name)
                    
                    if df.empty:
                        continue
                    
                    # Chuyển DataFrame thành text có cấu trúc
                    # Format: Sheet name, header, và từng dòng dữ liệu
                    sheet_text = f"=== SHEET: {sheet_name} ===\n\n"
                    
                    # Thêm header
                    headers = df.columns.tolist()
                    sheet_text += "HEADER: " + " | ".join([str(h) for h in headers]) + "\n\n"
                    
                    # Thêm từng dòng dữ liệu với header
                    for idx, row in df.iterrows():
                        row_text = []
                        for col in df.columns:
                            value = row[col]
                            # Bỏ qua giá trị NaN
                            if pd.notna(value):
                                row_text.append(f"{col}: {value}")
                        
                        if row_text:
                            sheet_text += " | ".join(row_text) + "\n"
                    
                    sheet_contents.append(sheet_text)
                    total_rows += len(df)
                    
                except Exception as e:
                    logger.warning(f"Lỗi đọc sheet '{sheet_name}': {str(e)}")
                    continue
            
            if not sheet_contents:
                return {
                    'success': False,
                    'content': '',
                    'error': 'Không thể đọc nội dung từ file Excel'
                }
            
            # Kết hợp tất cả các sheet
            full_text = "\n\n".join(sheet_contents)
            
            # Metadata
            metadata = {
                'num_sheets': len(excel_file.sheet_names),
                'total_rows': total_rows,
                'file_type': 'Excel',
                'source': file_path
            }
            
            return {
                'success': True,
                'content': full_text,
                'metadata': metadata,
                'sheet_contents': sheet_contents  # Để chunk theo sheet nếu cần
            }
            
        except Exception as e:
            logger.error(f"Lỗi đọc file Excel: {str(e)}")
            return {
                'success': False,
                'content': '',
                'error': str(e)
            }
    
    @classmethod
    async def process_file(cls, file_path: str, filename: str) -> Dict[str, any]:
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
            result = await cls.extract_text_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            result = await cls.extract_text_from_docx(file_path)
        elif ext in ['.xlsx', '.xls']:
            result = await cls.extract_text_from_excel(file_path)
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
    
    @classmethod
    async def process_and_chunk_file(
        cls, 
        file_path: str, 
        filename: str,
        knowledge_base_detail_id: int
    ) -> Dict[str, any]:
        """
        Xử lý file, chunk nội dung và lưu vào database
        
        Args:
            file_path: Đường dẫn đến file
            filename: Tên file gốc
            knowledge_base_detail_id: ID của knowledge_base_detail
            
        Returns:
            Dict chứa thông tin kết quả xử lý
        """
        try:
            # Bước 1: Extract text từ file
            result = await cls.process_file(file_path, filename)
            
            if not result.get('success'):
                return result
            
            ext = os.path.splitext(filename)[1].lower()
            
            # Bước 2: Chunk nội dung
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=cls.CHUNK_SIZE,
                chunk_overlap=cls.CHUNK_OVERLAP
            )
            
            all_chunks = []
            
            # Xử lý đặc biệt cho file Excel
            if ext in ['.xlsx', '.xls'] and 'sheet_contents' in result:
                # Chunk từng sheet riêng để giữ context
                for sheet_text in result['sheet_contents']:
                    # Extract header từ sheet_text
                    lines = sheet_text.split('\n')
                    sheet_name = lines[0] if lines else ""
                    header_line = ""
                    
                    # Tìm dòng HEADER
                    for line in lines:
                        if line.startswith("HEADER:"):
                            header_line = line
                            break
                    
                    # Chunk sheet content
                    chunks = text_splitter.split_text(sheet_text)
                    
                    # Thêm header vào mỗi chunk nếu chunk không có header
                    for chunk in chunks:
                        if header_line and "HEADER:" not in chunk:
                            # Thêm sheet name và header vào đầu chunk
                            enhanced_chunk = f"{sheet_name}\n{header_line}\n\n{chunk}"
                            all_chunks.append(enhanced_chunk)
                        else:
                            all_chunks.append(chunk)
            
            # Xử lý cho các file khác (PDF, DOCX)
            elif 'documents' in result:
                # Split từ langchain documents
                for doc in result['documents']:
                    chunks = text_splitter.split_text(doc.page_content)
                    all_chunks.extend(chunks)
            else:
                # Split từ text content
                all_chunks = text_splitter.split_text(result['content'])
            
            if not all_chunks:
                return {
                    'success': False,
                    'error': 'Không có nội dung để chunk'
                }
            
            # Bước 3: Tạo embeddings và lưu vào database
            chunks_data = []
            for chunk_text in all_chunks:
                # Tạo embedding
                vector = await get_embedding_gemini(chunk_text)
                
                if vector is not None:
                    chunks_data.append({
                        'chunk_text': chunk_text,
                        'search_vector': vector.tolist(),
                        'knowledge_base_detail_id': knowledge_base_detail_id
                    })
            
            # Insert vào database
            if chunks_data:
                await insert_chunks_to_db(chunks_data)
            
            return {
                'success': True,
                'message': f'Đã xử lý file {filename}',
                'chunks_created': len(chunks_data),
                'metadata': result['metadata']
            }
            
        except Exception as e:
            logger.error(f"Lỗi xử lý và chunk file {filename}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


async def process_uploaded_file(
    file_path: str, 
    filename: str,
    knowledge_base_detail_id: int = None
) -> Dict[str, any]:
    """
    Function wrapper để xử lý file upload
    
    Args:
        file_path: Đường dẫn đến file đã upload
        filename: Tên file gốc
        knowledge_base_detail_id: ID của knowledge_base_detail (optional)
        
    Returns:
        Dict chứa content và metadata
    """
    if knowledge_base_detail_id is not None:
        # Xử lý và chunk vào database
        return await FileProcessor.process_and_chunk_file(
            file_path, 
            filename, 
            knowledge_base_detail_id
        )
    else:
        # Chỉ extract text, không chunk
        return await FileProcessor.process_file(file_path, filename)
