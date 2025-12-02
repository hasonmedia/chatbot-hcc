// @/components/ChatComponents.tsx
"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { MessageData } from "@/types/message";
import type { ChatSession } from "@/hooks/useAdminChat";
import { UserCircle2, Bot } from "lucide-react";
import { useLLM } from "@/hooks/useLLM";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export const formatTime = (isoString: string) => {
  try {
    if (!isoString) return "vừa xong";
    const date = new Date(isoString);
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return "vừa xong";
    }
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "vừa xong";
  }
};

export const formatTimeAgo = (isoString: string) => {
  try {
    if (!isoString) return "Vừa xong";
    const now = new Date();
    const date = new Date(isoString);
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return "Vừa xong";
    }
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
  } catch (e) {
    return "Vừa xong";
  }
};

// --- COMPONENT CON: SESSION ITEM ---
interface SessionItemProps {
  session: ChatSession;
  isActive?: boolean;
  onClick: () => void;
}

export function SessionItem({
  session,
  isActive = false,
  onClick,
}: SessionItemProps) {
  const isClosed = false; // Bổ sung logic sau
  let displayContent;
  let previewContent = "";
  // 2. Thử phân tích (parse) msg.content
  try {
    const parsed = JSON.parse(session.last_message);

    // 3. Nếu phân tích thành công VÀ có thuộc tính 'message'
    if (parsed && parsed.message) {
      displayContent = parsed.message;
    } else {
      // Là JSON nhưng không có 'message', hiển thị nguyên bản
      displayContent = session.last_message;
    }
  } catch (error) {
    // 4. Nếu phân tích lỗi (tức là nó chỉ là text bình thường "hihi")
    displayContent = session.last_message;
  }
  if (displayContent) {
    const lines = displayContent.split("\n").slice(0, 2);
    previewContent = lines.join("\n");
    if (displayContent.split("\n").length > 2) {
      previewContent += "...";
    }
  }
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className="h-auto w-full justify-start p-3"
      onClick={onClick}
    >
      <div className="flex w-full flex-col items-start text-left">
        <div className="flex w-full justify-between">
          <span
            className={`font-semibold ${
              isClosed ? "text-muted-foreground" : "text-primary"
            }`}
          >
            {session.customer_name || session.chat_session_id.slice(0, 8)}
          </span>
          <span
            className={`text-xs ${
              isActive ? "text-foreground" : "text-muted-foreground"
            } whitespace-nowrap`}
          >
            {formatTimeAgo(session.last_updated)}
          </span>
        </div>
        <ReactMarkdown
          // 2. Thêm plugin vào đây
          remarkPlugins={[remarkGfm]}
          // Đoạn code tùy chỉnh link của bạn vẫn giữ nguyên
          components={{
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
                {...props}
              >
                {children}
              </a>
            ),
          }}
        >
          {previewContent}
        </ReactMarkdown>
      </div>
    </Button>
  );
}

// --- COMPONENT CON: MESSAGE ITEM ---
type MessageItemProps = {
  msg: MessageData;
};

export const MessageItem: React.FC<MessageItemProps> = ({ msg }) => {
  const isCustomer = msg.sender_type === "customer";
  const isBot = msg.sender_type === "bot";
  const isAdmin = msg.sender_type === "admin";

  // --- Logic xử lý dữ liệu (không đổi) ---
  const getAvatarFallback = () => {
    if (isCustomer) return <UserCircle2 />;
    if (isBot) return <Bot />;
    if (isAdmin)
      return msg.sender_type ? msg.sender_type.charAt(0).toUpperCase() : "CB";
    return "?";
  };

  let displayContent;
  try {
    let parsed = JSON.parse(msg.content);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed); // Parse lần 2
    }
    if (parsed && parsed.message) {
      displayContent = parsed.message;
    } else {
      displayContent = msg.content;
    }
  } catch (error) {
    displayContent = msg.content;
  }
  const { llmConfig } = useLLM();
  const getSenderName = () => {
    if (isBot) return llmConfig?.botName || "Bot hỗ trợ";
    if (isAdmin) return `Cán bộ: ${msg.sender_type || "Hỗ trợ viên"}`;
    return null; // Không hiển thị tên cho customer
  };

  // --- Logic hiển thị (ĐÃ ĐẢO NGƯỢC) ---

  // 1. Tin nhắn của Bot hoặc Admin (HIỂN THỊ BÊN PHẢI)
  if (isBot || isAdmin) {
    return (
      <div className="flex items-start gap-3 justify-end">
        {" "}
        {/* <-- THÊM justify-end */}
        <div className="rounded-lg bg-muted p-3 max-w-[75%] text-left">
          {" "}
          {/* <-- Đổi sang bg-muted */}
          <p className="text-sm font-semibold mb-1">{getSenderName()}</p>
          <ReactMarkdown
            // 2. Thêm plugin vào đây
            remarkPlugins={[remarkGfm]}
            // Đoạn code tùy chỉnh link của bạn vẫn giữ nguyên
            components={{
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                  {...props}
                >
                  {children}
                </a>
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
          {msg.image && Array.isArray(msg.image) && msg.image.length > 0 && (
            <img
              src={msg.image[0]}
              alt="Hình ảnh nhận được"
              className="mt-2 rounded-md max-w-xs"
            />
          )}
          <span className="text-xs text-muted-foreground block text-right mt-1">
            {" "}
            {/* <-- Đổi sang text-right */}
            {formatTime(msg.created_at)}
          </span>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // 2. Tin nhắn của Công dân (Người dùng) - (HIỂN THỊ BÊN TRÁI)
  return (
    <div className="flex items-start gap-3">
      {" "}
      {/* <-- BỎ justify-end */}
      <Avatar className="h-8 w-8">
        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-primary text-primary-foreground p-3 max-w-[75%]">
        {" "}
        {/* <-- Đổi sang bg-primary */}
        {/* Không hiển thị tên cho customer */}
        {/* <p className="text-sm whitespace-pre-wrap">{displayContent}</p> */}
        <ReactMarkdown
          // 2. Thêm plugin vào đây
          remarkPlugins={[remarkGfm]}
          // Đoạn code tùy chỉnh link của bạn vẫn giữ nguyên
          components={{
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
                {...props}
              >
                {children}
              </a>
            ),
          }}
        >
          {displayContent}
        </ReactMarkdown>
        {msg.image && Array.isArray(msg.image) && msg.image.length > 0 && (
          <img
            src={msg.image[0]}
            alt="Hình ảnh nhận được"
            className="mt-2 rounded-md max-w-xs"
          />
        )}
        <span className="text-xs text-primary-foreground/80 block text-left mt-1">
          {" "}
          {/* <-- Đổi sang text-left */}
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );
};
