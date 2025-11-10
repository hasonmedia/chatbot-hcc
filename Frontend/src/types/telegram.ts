// Telegram Bot Types
export interface TelegramBot {
  id: number;
  bot_name: string;
  bot_token: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_id: number;
}

export interface TelegramBotCreateRequest {
  bot_name: string;
  bot_token: string;
  description?: string;
}

export interface TelegramBotUpdateRequest {
  bot_name?: string;
  bot_token?: string;
  description?: string;
}

export interface TelegramBotsResponse {
  bots: TelegramBot[];
  total: number;
}
