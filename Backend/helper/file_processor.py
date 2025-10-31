"""
File Processor Helper
Xử lý đọc nội dung từ các file PDF, WORD, Excel và chunk vào database
"""
import os
import logging
from typing import Dict, Optional, List, Union
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
from bs4 import BeautifulSoup # Cần cho rich text: pip install beautifulsoup4

logger = logging.getLogger(__name__)


async def insert_chunks_to_db(chunks_data: list):
    """
    Insert chunks vào database (BULK)
    
    Args:
        chunks_data: List của dict chứa chunk_text, search_vector, knowledge_base_detail_id
    """
    async with AsyncSessionLocal() as session:
        try:
            new_chunks = []
            for d in chunks_data:
                new_chunks.append(
                    DocumentChunk(
                        chunk_text=str(d['chunk_text']),
                        search_vector=d.get('search_vector'),
                        knowledge_base_detail_id=d['knowledge_base_detail_id']
                    )
                )
            
            # Thêm tất cả vào session một lần
            session.add_all(new_chunks) 
            
            # Commit một lần duy nhất
            await session.commit()
            
            logger.info(f"Đã insert {len(new_chunks)} chunks vào database")
        except Exception as e:
            logger.error(f"Lỗi bulk insert chunks: {str(e)}")
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
                # Cần cài: pip install python-docx
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
                    # Lưu ý: fallback này không trả về 'documents'
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
        Đọc nội dung từ file Excel sử dụng UnstructuredExcelLoader
        """
        try:
            loader = UnstructuredExcelLoader(file_path, mode="elements")
            documents = loader.load()
            
            # Kết hợp nội dung
            full_text = "\n\n".join([doc.page_content for doc in documents])
            
            # Metadata
            metadata = {
                'num_elements': len(documents),
                'file_type': 'Excel'
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
        """
        try:
            # Bước 1: Extract text từ file
            result = await cls.process_file(file_path, filename)
            
            if not result.get('success'):
                return result
            
            # Bước 2: Chunk nội dung
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=cls.CHUNK_SIZE,
                chunk_overlap=cls.CHUNK_OVERLAP
            )
            
            all_chunks = []
            if 'documents' in result:
                # Split từ langchain documents (ưu tiên)
                for doc in result['documents']:
                    chunks = text_splitter.split_text(doc.page_content)
                    all_chunks.extend(chunks)
            else:
                # Split từ text content (fallback)
                all_chunks = text_splitter.split_text(result['content'])
            
            if not all_chunks:
                return {
                    'success': False,
                    'error': 'Không có nội dung để chunk'
                }
            
            # === SỬA ĐỔI: BATCH EMBEDDING ===
            # 1. Gom tất cả text vào một list
            all_texts = [chunk for chunk in all_chunks if chunk] 
            logger.info(f"Chuẩn bị tạo embedding cho {len(all_texts)} chunks từ file {filename}.")

            # 2. Gọi API embedding MỘT LẦN cho cả batch
            try:
                all_vectors = await get_embedding_gemini(all_texts)
                logger.info(f"Đã tạo thành công {len(all_vectors)} vectors.")
            except Exception as e:
                logger.error(f"Lỗi khi gọi batch embedding: {str(e)}")
                return {'success': False, 'error': f"Lỗi embedding: {str(e)}"}

            # 3. Chuẩn bị data
            chunks_data = []
            for text, vector in zip(all_texts, all_vectors):
                chunks_data.append({
                    'chunk_text': text,
                    'search_vector': vector, # Giả sử hàm gemini trả về list
                    'knowledge_base_detail_id': knowledge_base_detail_id
                })
            
            # 4. Insert MỘT LẦN vào CSDL (dùng hàm đã sửa)
            if chunks_data:
                await insert_chunks_to_db(chunks_data)
            
            return {
                'success': True,
                'message': f'Đã xử lý file {filename}',
                'chunks_created': len(chunks_data),
                'metadata': result['metadata']
            }
            # === KẾT THÚC SỬA ĐỔI ===
            
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


# ==========================================================
# HÀM MỚI ĐỂ XỬ LÝ RICH TEXT (NHẬP THỦ CÔNG)
# ==========================================================
async def process_rich_text(
    raw_content: str, 
    knowledge_base_detail_id: int
) -> Dict[str, any]:
    """
    Xử lý nội dung rich text (HTML), chunk, tạo vector và lưu vào CSDL
    """
    try:
        # Bước 1: Làm sạch HTML để lấy text
        soup = BeautifulSoup(raw_content, "html.parser")
        text_content = soup.get_text(separator="\n", strip=True)
        
        if not text_content:
            return {'success': False, 'error': 'Nội dung text rỗng sau khi lọc HTML'}

        # Bước 2: Chunk text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=FileProcessor.CHUNK_SIZE,
            chunk_overlap=FileProcessor.CHUNK_OVERLAP
        )
        all_chunks = text_splitter.split_text(text_content)
        
        if not all_chunks:
            return {'success': False, 'error': 'Không có nội dung để chunk sau khi lọc'}

        logger.info(f"Đã chunk nội dung rich text thành {len(all_chunks)} chunks.")

        # Bước 3: Tạo Embeddings (Batch)
        all_texts = [chunk for chunk in all_chunks if chunk]
        
        try:
            all_vectors = await get_embedding_gemini(all_texts)
            logger.info(f"Đã tạo thành công {len(all_vectors)} vectors cho rich text.")
        except Exception as e:
            logger.error(f"Lỗi khi gọi batch embedding cho rich text: {str(e)}")
            return {'success': False, 'error': f"Lỗi embedding: {str(e)}"}
        
        # Bước 4: Chuẩn bị data và Lưu vào CSDL (Batch)
        chunks_data = []
        for text, vector in zip(all_texts, all_vectors):
            chunks_data.append({
                'chunk_text': text,
                'search_vector': vector,
                'knowledge_base_detail_id': knowledge_base_detail_id
            })
        
        if chunks_data:
            await insert_chunks_to_db(chunks_data) # Gọi hàm đã sửa
        
        return {
            'success': True,
            'chunks_created': len(chunks_data),
            'source_type': 'RICH_TEXT'
        }

    except Exception as e:
        logger.error(f"Lỗi khi xử lý rich text: {str(e)}")
        return {'success': False, 'error': str(e)}