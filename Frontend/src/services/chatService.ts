import axiosClient from "@/config/axios";

import type { MessageData } from "@/types/message";

const VITE_URL_WS = import.meta.env.VITE_URL_WS || "ws://localhost:8000";

type OnMessageCallback = (data: any) => void;

let socketCustomer: WebSocket | null = null;
let socketAdmin: WebSocket | null = null;

export const connectCustomerSocket = (onMessage: OnMessageCallback): void => {
  if (socketCustomer) return;

  const sessionId = localStorage.getItem("chatSessionId");
  if (!sessionId) {
    console.error("Không tìm thấy session ID để kết nối WebSocket.");
    return;
  }

  socketCustomer = new WebSocket(
    `${VITE_URL_WS}/chat/ws/customer?sessionId=${sessionId}`
  );

  socketCustomer.onopen = () => {
    console.log("Customer WebSocket connected");
  };

  socketCustomer.onmessage = (event: MessageEvent) => {
    try {
      const data: MessageData = JSON.parse(event.data);
      console.log("Customer nhận tin nhắn:", data);
      onMessage(data);
    } catch (error) {
      console.error("Lỗi parse tin nhắn JSON từ customer WS:", error);
    }
  };

  socketCustomer.onclose = () => {
    console.log("Customer WebSocket disconnected");
    socketCustomer = null;
  };

  socketCustomer.onerror = (error) => {
    console.error("Customer WebSocket error:", error);
  };
};

export const connectAdminSocket = (
  onMessage: OnMessageCallback
): WebSocket | null => {
  if (socketAdmin) {
    console.log("Admin WebSocket đã kết nối.");
    return socketAdmin;
  }

  socketAdmin = new WebSocket(`${VITE_URL_WS}/chat/ws/admin`);

  socketAdmin.onopen = () => {
    console.log("Admin WebSocket connected");
  };
  socketAdmin.onmessage = (event: MessageEvent) => {
    try {
      // Parse dữ liệu có thể là BackendSessionData hoặc MessageData
      const data: any = JSON.parse(event.data);
      console.log("Admin nhận được data:", data);

      // Gửi thẳng dữ liệu về hook để xử lý
      onMessage(data);
    } catch (error) {
      console.error("Lỗi parse tin nhắn JSON từ admin WS:", error);
    }
  };
  socketAdmin.onclose = () => {
    console.log("Admin WebSocket disconnected");
    socketAdmin = null;
  };

  socketAdmin.onerror = (error) => {
    console.error("Admin WebSocket error:", error);
  };

  return socketAdmin;
};

// Gửi tin nhắn
export const sendMessage = (
  chatSessionId: string,
  senderType: MessageData["sender_type"], // Dùng type từ MessageData
  content: string,
  isAdmin: boolean = false,
  image: string | null = null
): void => {
  const targetSocket = isAdmin ? socketAdmin : socketCustomer;

  if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    const payload = {
      chat_session_id: parseInt(chatSessionId),
      sender_type: senderType,
      content,
      image: image || null,
    };
    targetSocket.send(JSON.stringify(payload));
    console.log(
      "Đã gửi tin nhắn qua",
      isAdmin ? "Admin" : "Customer",
      "socket:",
      payload
    );
  } else {
    console.error(
      `${
        isAdmin ? "Admin" : "Customer"
      } Socket không sẵn sàng. Không thể gửi tin nhắn.`
    );

    // Thử kết nối lại nếu socket bị đóng
    if (
      isAdmin &&
      (!socketAdmin || socketAdmin.readyState === WebSocket.CLOSED)
    ) {
      console.log("Thử kết nối lại Admin WebSocket...");
      // Có thể cần callback để kết nối lại
    }
  }
};

// Ngắt kết nối
export const disconnectCustomer = (): void => {
  if (socketCustomer) {
    socketCustomer.close();
  }
};

export const disconnectAdmin = (): void => {
  if (socketAdmin) {
    socketAdmin.close();
  }
};

// --- API Calls ---
export const createSession = async (): Promise<string> => {
  try {
    const response = await axiosClient.post("/chat/session");
    return response.data.id;
  } catch (error) {
    console.error("Lỗi khi tạo session mới:", error);
    throw error;
  }
};

export const checkSession = async (): Promise<string> => {
  // FIX 1: Đổi number -> string
  try {
    let sessionId = localStorage.getItem("chatSessionId");

    // FIX 2: Xử lý trường hợp không tìm thấy session ID trong localStorage
    if (!sessionId) {
      console.log("Không tìm thấy chatSessionId trong localStorage.");
      throw new Error("No session ID found in localStorage.");
    }

    // Giả định API trả về object có dạng { data: { id: string } }
    const response = await axiosClient.get<{ id: string }>(
      `/chat/session/${sessionId}`
    );

    // API xác nhận session ID là hợp lệ
    sessionId = response.data.id;
    console.log("Đã xác thực session cũ:", sessionId);
    return sessionId; // Trả về string
  } catch (error) {
    console.error("Lỗi khi kiểm tra session:", error);
    // Nếu có lỗi (404, 500, hoặc lỗi "No session ID" ở trên),
    // xóa session ID cũ/không hợp lệ đi
    localStorage.removeItem("chatSessionId");

    // Ném lỗi để logic bên ngoài (trong hook) có thể bắt và xử lý
    throw error;
  }
};

// Lấy lịch sử chat (cho 1 session)
export const getChatHistory = async (
  chatSessionId: string,
  page: number = 1,
  limit: number = 10
): Promise<MessageData[]> => {
  try {
    const response = await axiosClient.get(
      `/chat/history/${chatSessionId}?page=${page}&limit=${limit}`
    );

    // Map dữ liệu nếu cần thiết
    const messages = response.data.map((item: any) => ({
      id: String(item.id || Date.now()),
      chat_session_id: String(item.chat_session_id || chatSessionId),
      sender_type: item.sender_type,
      content:
        typeof item.content === "string"
          ? item.content
          : item.content
          ? JSON.parse(item.content).message || ""
          : "",
      created_at: item.created_at,
      image: item.image || null,
    }));

    return messages;
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử chat:", error);
    throw error;
  }
};

// Đếm tin nhắn theo kênh
export const count_message_by_channel = async (): Promise<any> => {
  try {
    const response: any = await axiosClient.get("/chat/admin/count_by_channel");
    return response;
  } catch (error) {
    console.error("Lỗi khi đếm tin nhắn theo kênh:", error);
    throw error;
  }
};

// Cập nhật trạng thái phiên chat
export const updateStatus = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosClient.patch(`/chat/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// Xóa phiên chat
export const deleteSessionChat = async (ids: string[]): Promise<any> => {
  try {
    const res = await axiosClient.delete(`/chat/chat_sessions`, {
      data: { ids },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

// Xóa tin nhắn
export const deleteMess = async (
  ids: string[],
  chatId: string
): Promise<any> => {
  try {
    const res = await axiosClient.delete(`/chat/messages/${chatId}`, {
      data: { ids },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

// Cập nhật trạng thái "alert"
export const updateAlertStatus = async (
  sessionId: string,
  alertStatus: boolean
): Promise<any> => {
  try {
    const response = await axiosClient.put(`/chat/alert/${sessionId}`, {
      alert: alertStatus ? "true" : "false", // API của bạn có vẻ nhận string "true"/"false"
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái alert:", error);
    throw error;
  }
};

// Gửi tin nhắn hàng loạt
export const sendBulkMessage = async (data: any): Promise<any> => {
  try {
    const res = await axiosClient.post(`/chat/send_message`, data);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getAllChatHistory = async (): Promise<any[]> => {
  try {
    const response = await axiosClient.get("/chat/admin/history");
    // Map dữ liệu từ backend sang frontend format
    const sessions = response.data.map((item: any) => ({
      chat_session_id: String(item.session_id), // Convert number to string
      customer_name: item.name || `Session-${item.session_id}`,
      last_message:
        typeof item.content === "string"
          ? item.content
          : item.content
          ? JSON.parse(item.content).message || ""
          : "",
      last_updated: item.created_at,
      status: item.status,
      alert: item.alert,
      channel: item.channel,
      current_receiver: item.current_receiver,
      sender_type: item.sender_type,
    }));
    return sessions;
  } catch (error) {
    console.error("Lỗi khi lấy toàn bộ lịch sử chat:", error);
    throw error;
  }
};
