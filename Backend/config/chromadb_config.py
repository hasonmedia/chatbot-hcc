import chromadb
from chromadb.config import Settings
import logging
import os
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Khởi tạo ChromaDB client
CHROMA_DATA_PATH = os.getenv("CHROMA_DATA_PATH", "./chroma_data")

os.environ["ANONYMIZED_TELEMETRY"] = "False"

try:
    # Tắt telemetry hoàn toàn
    chroma_client = chromadb.PersistentClient(
        path=CHROMA_DATA_PATH,
        settings=Settings(
            anonymized_telemetry=False,  # Tắt telemetry
            allow_reset=True,
            is_persistent=True
        )
    )
    logger.info(f"✅ ChromaDB client initialized at: {CHROMA_DATA_PATH}")
except Exception as e:
    logger.error(f"❌ Error initializing ChromaDB: {str(e)}")
    raise


def get_or_create_collection(collection_name: str = "document_chunks"):
    """
    Lấy hoặc tạo collection trong ChromaDB
    
    Args:
        collection_name: Tên collection (mặc định: document_chunks)
    
    Returns:
        Collection object
    """
    try:
        collection = chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}  # Sử dụng cosine similarity
        )
        return collection
    except Exception as e:
        logger.error(f"Error getting/creating collection: {str(e)}")
        raise


async def add_documents_to_chroma(
    chunks_data: List[Dict],
    collection_name: str = "document_chunks"
) -> bool:
    """
    Thêm documents vào ChromaDB
    
    Args:
        chunks_data: List của dict chứa:
            - chunk_text: Nội dung text
            - search_vector: Embedding vector
            - knowledge_base_detail_id: ID detail
        collection_name: Tên collection
    
    Returns:
        bool: True nếu thành công
    """
    try:
        collection = get_or_create_collection(collection_name)
        
        # Lấy số lượng documents hiện tại để tạo ID unique
        current_count = collection.count()
        
        # Chuẩn bị dữ liệu cho ChromaDB
        ids = []
        documents = []
        embeddings = []
        metadatas = []
        
        for idx, chunk in enumerate(chunks_data):
            # Tạo ID unique: detail_id + timestamp + index để tránh trùng
            import time
            timestamp = int(time.time() * 1000)  # milliseconds
            doc_id = f"detail_{chunk['knowledge_base_detail_id']}_ts_{timestamp}_{current_count + idx}"
            ids.append(doc_id)
            documents.append(chunk['chunk_text'])
            embeddings.append(chunk['search_vector'])
            metadatas.append({
                'knowledge_base_detail_id': chunk['knowledge_base_detail_id'],
                'chunk_index': idx
            })
        
        # Add batch vào ChromaDB
        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        logger.info(f"✅ Đã thêm {len(ids)} documents vào ChromaDB collection '{collection_name}'")
        return True
        
    except Exception as e:
        logger.error(f"❌ Lỗi khi thêm documents vào ChromaDB: {str(e)}")
        raise


async def delete_documents_by_detail_id(
    detail_id: int,
    collection_name: str = "document_chunks"
) -> bool:
    """
    Xóa tất cả documents liên quan đến một knowledge_base_detail_id
    
    Args:
        detail_id: ID của knowledge_base_detail
        collection_name: Tên collection
    
    Returns:
        bool: True nếu thành công
    """
    try:
        collection = get_or_create_collection(collection_name)
        
        # Query để lấy tất cả IDs có detail_id này
        results = collection.get(
            where={"knowledge_base_detail_id": detail_id}
        )
        
        if results and results['ids']:
            # Xóa tất cả documents
            collection.delete(ids=results['ids'])
            logger.info(f"✅ Đã xóa {len(results['ids'])} documents của detail_id={detail_id} từ ChromaDB")
        else:
            logger.info(f"ℹ️ Không tìm thấy documents nào với detail_id={detail_id}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Lỗi khi xóa documents từ ChromaDB: {str(e)}")
        return False


async def search_similar_chunks(
    query_embedding: List[float],
    top_k: int = 5,
    collection_name: str = "document_chunks",
    detail_ids: Optional[List[int]] = None
) -> List[Dict]:
    """
    Tìm kiếm các chunks tương tự dựa trên embedding
    
    Args:
        query_embedding: Vector embedding của query
        top_k: Số lượng kết quả trả về
        collection_name: Tên collection
        detail_ids: List các detail_id để filter (optional)
    
    Returns:
        List các dict chứa content và metadata
    """
    try:
        collection = get_or_create_collection(collection_name)
        
        # Chuẩn bị where clause nếu có filter
        where_clause = None
        if detail_ids:
            where_clause = {
                "knowledge_base_detail_id": {"$in": detail_ids}
            }
        
        # Thực hiện query
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_clause,
            include=["documents", "distances", "metadatas"]
        )
        
        # Format kết quả
        formatted_results = []
        if results and results['documents'] and results['documents'][0]:
            for idx in range(len(results['documents'][0])):
                formatted_results.append({
                    "content": results['documents'][0][idx],
                    "distance": results['distances'][0][idx] if results['distances'] else None,
                    "metadata": results['metadatas'][0][idx] if results['metadatas'] else {}
                })
        
        return formatted_results
        
    except Exception as e:
        logger.error(f"❌ Lỗi khi search trong ChromaDB: {str(e)}")
        raise


def reset_chroma_collection(collection_name: str = "document_chunks"):
    """
    Reset (xóa và tạo lại) collection - CHỈ DÙNG KHI CẦN
    
    Args:
        collection_name: Tên collection cần reset
    """
    try:
        chroma_client.delete_collection(name=collection_name)
        logger.warning(f"⚠️ Đã xóa collection '{collection_name}'")
        
        collection = get_or_create_collection(collection_name)
        logger.info(f"✅ Đã tạo lại collection '{collection_name}'")
        return collection
        
    except Exception as e:
        logger.error(f"❌ Lỗi khi reset collection: {str(e)}")
        raise
