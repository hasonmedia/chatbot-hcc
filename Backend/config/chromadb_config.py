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
    chroma_client = chromadb.PersistentClient(
        path=CHROMA_DATA_PATH,
        settings=Settings(
            anonymized_telemetry=False,  
            allow_reset=True,
            is_persistent=True
        )
    )
    logger.info(f"✅ ChromaDB client initialized at: {CHROMA_DATA_PATH}")
except Exception as e:
    logger.error(f"❌ Error initializing ChromaDB: {str(e)}")
    raise



# Đang dùng 
def get_or_create_collection(collection_name: str = "document_chunks"):

    try:
        collection = chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}  
        )
        return collection
    except Exception as e:
        logger.error(f"Error getting/creating collection: {str(e)}")
        raise

# Đang dùng 
async def add_chunks(
    chunks: List[Dict],
    collection_name: str = "document_chunks"
) -> bool:
    try:
        collection = get_or_create_collection(collection_name)

        ids = [chunk['id'] for chunk in chunks]
        documents = [chunk['content'] for chunk in chunks]
        embeddings = [chunk['embedding'] for chunk in chunks]
        # Lưu toàn bộ metadata từ chunks
        metadatas = [chunk.get('metadata', {}) for chunk in chunks]

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


# Đang dùng 
async def add_chunks_tthc(
    chunks: List[Dict],
    collection_name: str = "document_chunks"
) -> bool:
    try:
        collection = get_or_create_collection(collection_name)

        ids = [chunk['id'] for chunk in chunks]
        documents = [chunk['content'] for chunk in chunks]
        embeddings = [chunk['embedding'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]

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
    
    
# Đang dùng 
async def delete_chunks(
    knowledge_id: str,
    collection_name: str = "document_chunks"
) -> bool:

    try:
        
        collection = get_or_create_collection(collection_name)

        results = collection.get(where={"knowledge_id": str(knowledge_id)})

        if results and results['ids']:
            collection.delete(ids=results['ids'])
            logger.info(f"✅ Đã xóa {len(results['ids'])} documents của knowledge_id='{knowledge_id}' từ ChromaDB")
        else:
            logger.info(f"ℹ️ Không tìm thấy documents nào với knowledge_id='{knowledge_id}'")
        

        return True

    except Exception as e:
        logger.error(f"❌ Lỗi khi xóa documents từ ChromaDB: {str(e)}")
        return False



async def update_chunks(
    knowledge_id: str,
    new_chunks: List[Dict],
    collection_name: str = "document_chunks"
) -> bool:
    try:
        # Xóa các chunk cũ
        await delete_chunks(knowledge_id, collection_name)
        # Thêm các chunk mới
        await add_chunks(new_chunks, collection_name)
        logger.info(f"✅ Đã cập nhật chunks cho knowledge_id='{knowledge_id}'")
        return True
    except Exception as e:
        logger.error(f"❌ Lỗi khi cập nhật chunks: {str(e)}")
        raise


def list_chunks(collection_name: str = "document_chunks") -> List[Dict]:
   
    try:
        collection = get_or_create_collection(collection_name)
        results = collection.get(include=["documents", "metadatas"])
        return results
    except Exception as e:
        logger.error(f"❌ Lỗi khi liệt kê chunks: {str(e)}")
        raise

# Đang dùng 
async def search_chunks_tthc(
    query_embedding: List[float],
    top_k: int,
    collection_name: str = "document_chunks"
) -> List[Dict]:
   
    try:
        collection = get_or_create_collection(collection_name)


        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "distances", "metadatas"]
        )

        formatted_results = []
        if results and results['documents'] and results['documents'][0]:
            for idx in range(len(results['documents'][0])):
                metadata = results['metadatas'][0][idx] if results['metadatas'] else {}
                formatted_results.append({
                    "content":  metadata.get("procedure_name", results['documents'][0][idx])
                })

        return formatted_results

    except Exception as e:
        logger.error(f"❌ Lỗi khi search trong ChromaDB: {str(e)}")
        raise



# Đang dùng 
async def search_chunks_with_metadata(
    query_embedding: List[float],
    top_k: int,
    metadata_filter: Optional[Dict] = None,
    collection_name: str = "document_chunks"
) -> List[Dict]:
    
    try:
        collection = get_or_create_collection(collection_name)

        chroma_filter = None

        if metadata_filter:
            category_id = metadata_filter.get("category_id")
            file_names = metadata_filter.get("file_names", [])

            conditions = []

            if category_id is not None:
                conditions.append({"category_id": str(category_id)})

            if file_names:
                file_conditions = [{"file_name": fname} for fname in file_names]
                if len(file_conditions) > 1:
                    conditions.append({"$or": file_conditions})
                else:
                    conditions.append(file_conditions[0])

            if len(conditions) == 1:
                chroma_filter = conditions[0]
            elif len(conditions) > 1:
                chroma_filter = {"$and": conditions}


        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=chroma_filter,
            include=["documents", "distances", "metadatas"]
        )

        formatted_results = []
        if results and results['documents'] and results['documents'][0]:
            for idx in range(len(results['documents'][0])):
                formatted_results.append({
                    "text": results['documents'][0][idx],
                    "distance": results['distances'][0][idx] if results['distances'] else None,
                    "metadata": results['metadatas'][0][idx] if results['metadatas'] else {}
                })

        return formatted_results

    except Exception as e:
        logger.error(f"❌ Lỗi khi search với metadata trong ChromaDB: {str(e)}")
        raise



# Đang dùng 
async def search_chunks_with_metadata_tthc(
    query_embedding: List[float],
    matched_procedures: List[str],
    collection_name: str = "document_chunks"
) -> List[Dict]:
    try:    
        collection = get_or_create_collection(collection_name)

        if matched_procedures:
            if len(matched_procedures) == 1:
                metadata_filter = {"procedure_name": {"$eq": matched_procedures[0]}}
            else:
                metadata_filter = {
                    "$or": [
                        {"procedure_name": {"$eq": proc}} 
                        for proc in matched_procedures
                    ]
                }
        else:
            metadata_filter = None

        results = collection.query(
            query_embeddings=[query_embedding],
            where=metadata_filter,
            n_results=5,
            include=["documents", "metadatas"]
        )

        formatted_results = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]

        for i in range(len(docs)):
            formatted_results.append({
                "text": docs[i],
                "metadata": metas[i]
            })

        return formatted_results

    except Exception as e:
        logger.error(f"❌ Lỗi khi search với metadata trong ChromaDB: {str(e)}")
        raise