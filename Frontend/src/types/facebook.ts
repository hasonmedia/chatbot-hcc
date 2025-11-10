// Facebook Page Types
export interface FacebookPage {
  id: number;
  page_id: string;
  page_name: string;
  access_token: string;
  webhook_verify_token?: string | null;
  is_active: boolean;
  auto_response_enabled: boolean;
  url?: string | null;
  description?: string | null;
  category?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  created_at: string;
  updated_at: string;
  company_id: number;
}

export interface FacebookPageCreateRequest {
  page_id: string;
  page_name: string;
  access_token: string;
  url?: string;
  description?: string;
  category?: string;
  avatar_url?: string;
  cover_url?: string;
}

export interface FacebookPageUpdateRequest {
  page_id?: string;
  page_name?: string;
  access_token?: string;
  url?: string;
  description?: string;
  category?: string;
  avatar_url?: string;
  cover_url?: string;
}

export interface FacebookPagesResponse {
  pages: FacebookPage[];
  total: number;
}
