"""
Script để xem dữ liệu trong ChromaDB
Chạy script này để kiểm tra collections và documents trong ChromaDB
"""

import chromadb
from chromadb.config import Settings
import os
import json
from datetime import datetime

# Khởi tạo ChromaDB client
CHROMA_DATA_PATH = os.getenv("CHROMA_DATA_PATH", "./chroma_data")

os.environ["ANONYMIZED_TELEMETRY"] = "False"

chroma_client = chromadb.PersistentClient(
    path=CHROMA_DATA_PATH,
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=True,
        is_persistent=True
    )
)

def view_all_collections():
    """Xem tất cả collections có trong ChromaDB"""
    print("\n" + "="*80)
    print("📚 DANH SÁCH COLLECTIONS TRONG CHROMADB")
    print("="*80)
    
    collections = chroma_client.list_collections()
    
    if not collections:
        print("❌ Không có collection nào trong ChromaDB")
        return []
    
    print(f"\n✅ Tìm thấy {len(collections)} collection(s):\n")
    
    for idx, collection in enumerate(collections, 1):
        count = collection.count()
        print(f"{idx}. Collection: '{collection.name}'")
        print(f"   - Số lượng documents: {count}")
        print(f"   - Metadata: {collection.metadata}")
        print()
    
    return collections


def view_collection_details(collection_name: str = "document_chunks", limit: int = 10):
    """Xem chi tiết documents trong một collection"""
    print("\n" + "="*80)
    print(f"📄 CHI TIẾT COLLECTION: '{collection_name}'")
    print("="*80)
    
    try:
        collection = chroma_client.get_collection(name=collection_name)
        
        # Lấy tổng số documents
        total_count = collection.count()
        print(f"\n📊 Tổng số documents: {total_count}")
        
        if total_count == 0:
            print("❌ Collection này chưa có dữ liệu nào")
            return
        
        # Lấy dữ liệu (giới hạn số lượng để không quá tải)
        results = collection.get(
            limit=min(limit, total_count),
            include=["documents", "metadatas", "embeddings"]
        )
        
        print(f"\n📋 Hiển thị {len(results['ids'])} documents đầu tiên:")
        print("-" * 80)
        
        for idx, doc_id in enumerate(results['ids'], 1):
            print(f"\n{idx}. Document ID: {doc_id}")
            
            # Metadata
            if results['metadatas'] and idx-1 < len(results['metadatas']):
                metadata = results['metadatas'][idx-1]
                print(f"   Metadata:")
                for key, value in metadata.items():
                    print(f"      - {key}: {value}")
            
            # Document content (cắt ngắn nếu quá dài)
            if results['documents'] and idx-1 < len(results['documents']):
                content = results['documents'][idx-1]
                if len(content) > 200:
                    content = content[:200] + "..."
                print(f"   Content: {content}")
            
            # Embedding info
            if results['embeddings'] and idx-1 < len(results['embeddings']):
                embedding = results['embeddings'][idx-1]
                print(f"   Embedding: vector với {len(embedding)} dimensions")
            
            print("-" * 80)
        
        if total_count > limit:
            print(f"\n💡 Còn {total_count - limit} documents nữa. Tăng limit để xem thêm.")
    
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")


def view_documents_by_detail_id(detail_id: int, collection_name: str = "document_chunks"):
    """Xem tất cả documents của một knowledge_base_detail_id cụ thể"""
    print("\n" + "="*80)
    print(f"🔍 TÌM KIẾM DOCUMENTS THEO DETAIL_ID: {detail_id}")
    print("="*80)
    
    try:
        collection = chroma_client.get_collection(name=collection_name)
        
        # Query theo metadata
        results = collection.get(
            where={"knowledge_base_detail_id": detail_id},
            include=["documents", "metadatas", "embeddings"]
        )
        
        if not results['ids']:
            print(f"\n❌ Không tìm thấy documents nào với detail_id = {detail_id}")
            return
        
        print(f"\n✅ Tìm thấy {len(results['ids'])} documents:")
        print("-" * 80)
        
        for idx, doc_id in enumerate(results['ids'], 1):
            print(f"\n{idx}. Document ID: {doc_id}")
            
            if results['metadatas'] and idx-1 < len(results['metadatas']):
                metadata = results['metadatas'][idx-1]
                print(f"   Metadata: {metadata}")
            
            if results['documents'] and idx-1 < len(results['documents']):
                content = results['documents'][idx-1]
                if len(content) > 300:
                    content = content[:300] + "..."
                print(f"   Content: {content}")
            
            if results['embeddings'] and idx-1 < len(results['embeddings']):
                embedding = results['embeddings'][idx-1]
                print(f"   Embedding: {len(embedding)} dimensions")
            
            print("-" * 80)
    
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")


def search_documents_by_text(search_text: str, collection_name: str = "document_chunks", limit: int = 5):
    """Tìm kiếm documents theo nội dung text"""
    print("\n" + "="*80)
    print(f"🔍 TÌM KIẾM DOCUMENTS CHỨA TEXT: '{search_text}'")
    print("="*80)
    
    try:
        collection = chroma_client.get_collection(name=collection_name)
        
        # Lấy tất cả documents
        results = collection.get(
            include=["documents", "metadatas"]
        )
        
        # Filter documents chứa search_text
        found_docs = []
        for idx, doc in enumerate(results['documents']):
            if search_text.lower() in doc.lower():
                found_docs.append({
                    'id': results['ids'][idx],
                    'content': doc,
                    'metadata': results['metadatas'][idx] if results['metadatas'] else {}
                })
        
        if not found_docs:
            print(f"\n❌ Không tìm thấy documents nào chứa text: '{search_text}'")
            return
        
        print(f"\n✅ Tìm thấy {len(found_docs)} documents:")
        print("-" * 80)
        
        for idx, doc in enumerate(found_docs[:limit], 1):
            print(f"\n{idx}. Document ID: {doc['id']}")
            print(f"   Metadata: {doc['metadata']}")
            
            content = doc['content']
            if len(content) > 300:
                content = content[:300] + "..."
            print(f"   Content: {content}")
            print("-" * 80)
        
        if len(found_docs) > limit:
            print(f"\n💡 Còn {len(found_docs) - limit} documents nữa.")
    
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")


def export_collection_to_json(collection_name: str = "document_chunks", output_file: str = None):
    """Export toàn bộ collection ra file JSON"""
    try:
        collection = chroma_client.get_collection(name=collection_name)
        
        results = collection.get(
            include=["documents", "metadatas", "embeddings"]
        )
        
        if not results['ids']:
            print(f"❌ Collection '{collection_name}' không có dữ liệu")
            return
        
        # Tạo output filename nếu chưa có
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"chromadb_export_{collection_name}_{timestamp}.json"
        
        # Prepare data
        export_data = {
            "collection_name": collection_name,
            "export_time": datetime.now().isoformat(),
            "total_documents": len(results['ids']),
            "documents": []
        }
        
        for idx, doc_id in enumerate(results['ids']):
            doc_data = {
                "id": doc_id,
                "metadata": results['metadatas'][idx] if results['metadatas'] else {},
                "content": results['documents'][idx] if results['documents'] else "",
                "embedding_dimensions": len(results['embeddings'][idx]) if results['embeddings'] and results['embeddings'][idx] else 0
            }
            export_data["documents"].append(doc_data)
        
        # Save to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Đã export {len(results['ids'])} documents vào file: {output_file}")
        
    except Exception as e:
        print(f"❌ Lỗi khi export: {str(e)}")


def main_menu():
    """Menu chính"""
    while True:
        print("\n" + "="*80)
        print("🔧 CHROMADB DATA VIEWER")
        print("="*80)
        print("\n1. Xem tất cả collections")
        print("2. Xem chi tiết một collection")
        print("3. Tìm kiếm theo detail_id")
        print("4. Tìm kiếm theo nội dung text")
        print("5. Export collection ra JSON")
        print("6. Xem thống kê tổng quan")
        print("0. Thoát")
        print("-" * 80)
        
        choice = input("\nNhập lựa chọn của bạn: ").strip()
        
        if choice == "1":
            view_all_collections()
        
        elif choice == "2":
            collection_name = input("Nhập tên collection (Enter để dùng 'document_chunks'): ").strip()
            if not collection_name:
                collection_name = "document_chunks"
            
            limit = input("Số lượng documents muốn xem (Enter để dùng 10): ").strip()
            limit = int(limit) if limit.isdigit() else 10
            
            view_collection_details(collection_name, limit)
        
        elif choice == "3":
            detail_id = input("Nhập detail_id: ").strip()
            if not detail_id.isdigit():
                print("❌ detail_id phải là số!")
                continue
            
            collection_name = input("Nhập tên collection (Enter để dùng 'document_chunks'): ").strip()
            if not collection_name:
                collection_name = "document_chunks"
            
            view_documents_by_detail_id(int(detail_id), collection_name)
        
        elif choice == "4":
            search_text = input("Nhập text cần tìm: ").strip()
            if not search_text:
                print("❌ Vui lòng nhập text để tìm kiếm!")
                continue
            
            collection_name = input("Nhập tên collection (Enter để dùng 'document_chunks'): ").strip()
            if not collection_name:
                collection_name = "document_chunks"
            
            search_documents_by_text(search_text, collection_name)
        
        elif choice == "5":
            collection_name = input("Nhập tên collection (Enter để dùng 'document_chunks'): ").strip()
            if not collection_name:
                collection_name = "document_chunks"
            
            output_file = input("Nhập tên file output (Enter để tự động): ").strip()
            if not output_file:
                output_file = None
            
            export_collection_to_json(collection_name, output_file)
        
        elif choice == "6":
            print("\n" + "="*80)
            print("📊 THỐNG KÊ TỔNG QUAN")
            print("="*80)
            
            collections = chroma_client.list_collections()
            total_docs = sum(c.count() for c in collections)
            
            print(f"\n✅ Số collections: {len(collections)}")
            print(f"✅ Tổng số documents: {total_docs}")
            print(f"✅ Đường dẫn data: {CHROMA_DATA_PATH}")
            
            if collections:
                print("\nChi tiết:")
                for c in collections:
                    print(f"   - '{c.name}': {c.count()} documents")
        
        elif choice == "0":
            print("\n👋 Tạm biệt!")
            break
        
        else:
            print("❌ Lựa chọn không hợp lệ!")
        
        input("\n📌 Nhấn Enter để tiếp tục...")


if __name__ == "__main__":
    print("\n🚀 Đang kết nối tới ChromaDB...")
    print(f"📁 Data path: {CHROMA_DATA_PATH}")
    
    try:
        # Test connection
        collections = chroma_client.list_collections()
        print(f"✅ Kết nối thành công! Tìm thấy {len(collections)} collection(s)")
        
        # Run menu
        main_menu()
        
    except Exception as e:
        print(f"❌ Lỗi khi kết nối ChromaDB: {str(e)}")
