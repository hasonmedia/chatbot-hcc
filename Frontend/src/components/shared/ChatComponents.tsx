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
            {session.customer_name || session.chat_session_id}
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
  onImageClick?: (imageUrl: string) => void;
};

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  onImageClick,
}) => {
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
  let links: string[] = [];
  try {
    let parsed = JSON.parse(msg.content);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed); // Parse lần 2
    }
    if (parsed && parsed.message) {
      displayContent = parsed.message;
    }
    if (parsed && parsed.links && Array.isArray(parsed.links)) {
      links = parsed.links;
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
          {links.length > 0 && (
            <div className="mt-2 pt-2 border-t border-primary-foreground/20">
              <ul className="list-none p-0 m-0 space-y-1">
                {links.map((link, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline hover:text-blue-600 block truncate"
                      title={link}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {msg.image && (
            <div className="mt-2">
              {Array.isArray(msg.image) ? (
                <div className="flex flex-wrap gap-2">
                  {msg.image.map((imgUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imgUrl}
                        alt={`Hình ảnh ${index + 1}`}
                        className={`rounded-md max-w-xs max-h-40 object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                          msg.isOptimistic ? "opacity-75" : ""
                        }`}
                        onClick={() => onImageClick?.(imgUrl)}
                        title="Click để xem ảnh lớn"
                        onError={(e) => {
                          // Xử lý lỗi load ảnh (có thể là optimistic URL)
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = "0.5";
                          target.style.filter = "grayscale(100%)";
                        }}
                      />
                      {msg.isOptimistic && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                            Đang tải...
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={msg.image}
                    alt="Hình ảnh nhận được"
                    className={`rounded-md max-w-xs max-h-40 object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                      msg.isOptimistic ? "opacity-75" : ""
                    }`}
                    onClick={() => onImageClick?.(msg.image as string)}
                    title="Click để xem ảnh lớn"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = "0.5";
                      target.style.filter = "grayscale(100%)";
                    }}
                  />
                  {msg.isOptimistic && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                      <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                        Đang tải...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <span
            className={`text-xs block text-right mt-1 ${
              msg.isOptimistic
                ? "text-muted-foreground/50"
                : "text-muted-foreground"
            }`}
          >
            {/* {msg.isOptimistic ? "" : formatTime(msg.created_at)} */}
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
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
        {links.length > 0 && (
          <div className="mt-2 pt-2 border-t border-primary-foreground/20">
            <p className="text-xs mb-1 opacity-80">Liên kết liên quan:</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {links.map((link, index) => (
                <li key={index} className="text-sm">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-600 block truncate"
                    title={link}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {msg.image && (
          <div className="mt-2">
            {Array.isArray(msg.image) ? (
              <div className="flex flex-wrap gap-2">
                {msg.image.map((imgUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imgUrl}
                      alt={`Hình ảnh ${index + 1}`}
                      className={`rounded-md max-w-xs max-h-40 object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                        msg.isOptimistic ? "opacity-75" : ""
                      }`}
                      onClick={() => onImageClick?.(imgUrl)}
                      title="Click để xem ảnh lớn"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = "0.5";
                        target.style.filter = "grayscale(100%)";
                      }}
                    />
                    {msg.isOptimistic && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                        <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                          Đang tải...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={msg.image}
                  alt="Hình ảnh nhận được"
                  className={`rounded-md max-w-xs max-h-40 object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                    msg.isOptimistic ? "opacity-75" : ""
                  }`}
                  onClick={() => onImageClick?.(msg.image as string)}
                  title="Click để xem ảnh lớn"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = "0.5";
                    target.style.filter = "grayscale(100%)";
                  }}
                />
                {msg.isOptimistic && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                    <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                      Đang tải...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <span className="text-xs text-primary-foreground/80 block text-left mt-1">
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );
};
