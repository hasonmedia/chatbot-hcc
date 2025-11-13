// @/types/message.ts
export interface MessageData {
  id?: string; // Giả sử có ID
  chat_session_id?: string;
  sender_type: "customer" | "admin" | "bot";
  content: string;
  created_at: string;
  image?: string | null; // Hoặc string[] nếu là mảng ảnh
  // Bổ sung các trường khác nếu cần
}
export interface SendMessagePayload {
  chat_session_id: string;
  sender_type: string;
  content: string;
  image?: string | null;
}
export interface BackendSessionData {
  session_id: number;
  status: string;
  channel: string;
  url_channel: string;
  alert: string;
  name: string; // Sẽ được map thành customer_name
  time: string | null;
  current_receiver: string;
  previous_receiver: string | null;
  sender_type: "bot" | "customer" | "admin";
  content: string; // Sẽ được map thành last_message
  sender_name: string | null;
  created_at: string; // Sẽ được map thành last_updated
  image: any[];
}

export interface MessageItemProps {
  msg: MessageData;
}
