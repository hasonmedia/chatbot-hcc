// Zalo Bot Types
export interface ZaloBot {
  id: number;
  bot_name: string;
  access_token: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_id: number;
}

export interface ZaloBotCreateRequest {
  bot_name: string;
  access_token: string;
  description?: string;
}

export interface ZaloBotUpdateRequest {
  bot_name?: string;
  access_token?: string;
  description?: string;
}

export interface ZaloBotsResponse {
  bots: ZaloBot[];
  total: number;
}
