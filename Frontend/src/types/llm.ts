// Interface cho LLM Key data (không phải response từ API)
export interface LLMKey {
  name: string;
  key: string;
  type: "bot" | "embedding";
}

// Interface cho LLM Key từ API response
export interface LLMKeyData {
  id: number;
  name: string;
  key: string;
  type: "bot" | "embedding";
  llm_detail_id: number;
  created_at: string;
  updated_at: string;
}

// Interface cho LLM Detail từ API response
export interface LLMDetailResponse {
  id: number;
  name: string;
  key_free: string;
  llm_keys: LLMKeyData[];
}

// Interface cho LLM data (không phải response từ API)
export interface LLM {
  prompt: string;
  system_greeting: string;
  botName: string;
  bot_model_detail_id: string;
  embedding_model_detail_id: string;
  company_id: string;
}

// Interface cho LLM data từ API response
export interface LLMData {
  id: number;
  prompt: string;
  created_at: string;
  system_greeting: string;
  botName: string;
  bot_model_detail_id: number;
  embedding_model_detail_id: number;
  llm_details: LLMDetailResponse[];
}

// Interface cho LLM response từ API
export interface LLMResponse {
  message: string;
  llm: LLMData;
}

// Interface cho LLM Key response từ API
export interface LLMKeyResponse {
  message: string;
  llm_key: LLMKeyData;
}
