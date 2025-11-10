import {
  ChatHeader,
  ChatInput,
  MessageItem,
} from "@/components/shared/ClientChatUI";
import { useClientChat } from "@/hooks/useClientChat";
import { useLLM } from "@/hooks/useLLM";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";
import { Loader2 } from "lucide-react";

const ClientChat = () => {
  // Gọi hook để lấy tất cả state và logic
  const {
    messages,
    newMessage,
    sessionId,
    isLoading,
    isConnecting,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    messagesEndRef,
  } = useClientChat();

  // Lấy thông tin LLM config để hiển thị botName
  const { llmConfig } = useLLM();

  return (
    <div className="flex h-full flex-col">
      <ChatHeader isConnecting={isConnecting} botName={llmConfig?.botName} />

      {/* Khu vực hiển thị tin nhắn */}
      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Đang tải lịch sử...
              </span>
            </div>
          ) : (
            messages.map((msg, index) => (
              <MessageItem key={msg.id || index} msg={msg} />
            ))
          )}
          {/* Div trống để tự động cuộn */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      {/* Khu vực nhập liệu */}
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        isConnecting={isConnecting}
        sessionId={sessionId}
      />
    </div>
  );
};

export default ClientChat;
