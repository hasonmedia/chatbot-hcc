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
    isBotActive,
    isWaitingBot,
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
    <div className="flex h-full flex-col overflow-hidden">
      <ChatHeader isConnecting={isConnecting} botName={llmConfig?.botName} />

      <ScrollArea className="flex-1 p-2 sm:p-4 h-full max-h-screen overflow-y-auto">
        <div className="p-2 sm:p-4 shrink-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-6 sm:p-8">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm sm:text-base text-muted-foreground">
                Đang tải lịch sử...
              </span>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {messages.map((msg, index) => (
                <MessageItem key={msg.id || index} msg={msg} />
              ))}

              <TypingIndicator isVisible={isBotActive} />
            </div>
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
        isWaitingBot={isWaitingBot}
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
    <div className="flex h-screen w-full bg-background flex-col overflow-hidden">
      {/* Navbar - responsive */}
      <div className="shrink-0">
        <Navbar01
          signInText="Đăng nhập"
          logo={<Logo />}
          ctaText="Bắt đầu Chat"
          onSignInClick={handleLoginClick}
        />
      </div>

      {/* Main content area - responsive layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - hidden on mobile and tablet */}
        <div className="w-56 lg:w-64 xl:w-72 border-r hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Main chat content - responsive */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <ChatUI />
          </div>

          {/* Mobile support panel - bottom sheet style */}
          <div className="lg:hidden border-t bg-background">
            <div className="h-32 sm:h-36 md:h-40 overflow-auto">
              <SupportPanel />
            </div>
          </div>
        </div>

        {/* Right support panel - desktop only */}
        <div className="w-72 lg:w-80 xl:w-96 border-l hidden lg:block shrink-0">
          <SupportPanel />
        </div>
      </div>
    </div>
  );
};
export default ClientChat;
