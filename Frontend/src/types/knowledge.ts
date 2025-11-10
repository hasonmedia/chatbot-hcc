export interface KnowledgeBaseItem {
  id: number;
  file_name: string | null;
  file_type: string | null;
  file_path: string | null;
  source_type: "FILE" | "RICH_TEXT" | null;
  raw_content: string | null;
  created_at: string;
  is_active: boolean;
  user_id: number;
}
export interface KnowledgeBaseResponse {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  details: KnowledgeBaseItem[];
}
