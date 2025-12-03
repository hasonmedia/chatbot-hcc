import {
  ChatHeader,
  ChatInput,
  MessageItem,
  Sidebar,
  SupportPanel,
} from "@/components/shared/ClientChatUI";
import { useClientChat } from "@/hooks/useClientChat";
import { useLLM } from "@/hooks/useLLM";
import { useFeedbackTimer } from "@/hooks/useFeedbackTimer";
import FeedbackModal from "@/components/shared/FeedbackModal";
import TypingIndicator from "@/components/TypingIndicator";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";
import { Loader2 } from "lucide-react";
import { Logo, Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useNavigate } from "react-router-dom";

const ChatUI = () => {
  const {
    messages,
    newMessage,
    sessionId,
    isLoading,
    isConnecting,
    isBotTyping,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    messagesEndRef,
  } = useClientChat();

  const { llmConfig } = useLLM();
  const { showFeedbackModal, closeFeedbackModal } = useFeedbackTimer({
    messages,
    sessionId,
  });

  return (
    <div className="flex h-full flex-col">
      <ChatHeader isConnecting={isConnecting} botName={llmConfig?.botName} />

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
            <>
              {messages.map((msg, index) => (
                <MessageItem key={msg.id || index} msg={msg} />
              ))}
              {/* Hiển thị typing indicator khi bot đang trả lời */}
              <TypingIndicator isVisible={isBotTyping} />
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        isConnecting={isConnecting}
        isBotTyping={isBotTyping}
        sessionId={sessionId}
      />

      {/* Modal đánh giá */}
      <FeedbackModal
        open={showFeedbackModal}
        onClose={closeFeedbackModal}
        sessionId={sessionId}
      />
    </div>
  );
};

const ClientChat = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };
  return (
    <div className="flex h-screen w-full bg-background flex-col">
      {/* Navbar */}
      <Navbar01
        signInText="Đăng nhập"
        logo={<Logo />}
        ctaText="Bắt đầu Chat"
        onSignInClick={handleLoginClick}
      />

      {/* Navigation */}
      {/* <GuestNavigation /> */}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r hidden lg:block">
          <Sidebar />
        </div>
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <ChatUI />
        </div>

        {/* Support panel - moved to bottom on mobile, side on desktop */}
        <div className="w-80 border-l hidden lg:block">
          <SupportPanel />
        </div>
      </div>

      {/* Mobile support panel */}
      <div className="lg:hidden border-t">
        <div className="h-40 overflow-auto">
          <SupportPanel />
        </div>
      </div>
    </div>
  );
};
export default ClientChat;
