export interface KnowledgeBaseItem {
  detail_id: number;
  file_name: string | null;
  file_type: string | null;
  file_path: string | null;
  description: string | null;
  source_type: "FILE" | "RICH_TEXT" | null;
  raw_content: string | null;
  detail_created_at: string;
  detail_updated_at: string;
  is_active: boolean;
  user_id: number;
  username: string | null;
  category_id: number;
  category_name: string;
}

export interface KnowledgeBaseResponse {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  details: KnowledgeBaseItem[];
}

export interface KnowledgeCategory {
  id: number;
  name: string;
  description?: string | null;
  knowledge_base_id: number;
  created_at: string;
  updated_at: string;
  file_count?: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
}
