import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Paperclip,
  SendHorizontal,
  Archive,
  Loader2,
  ArrowLeft,
  PanelRight,
} from "lucide-react";

import { useAdminChat } from "@/hooks/useAdminChat";
import { SessionItem, MessageItem } from "@/components/shared/ChatComponents";
import { RadioGroupSetting } from "../components/shared/RadioGroup";
import Countdown from "@/components/shared/Countdown";
import { toast } from "react-toastify";

export default function ChatPage() {
  const {
    isLoadingSessions,
    isLoadingMessages,
    filteredSessions,
    currentSessionId,
    currentSessionInfo,
    messages,
    newMessage,
    searchTerm,
    setNewMessage,
    updateChatSessionStatus,
    setSearchTerm,
    handleSelectSession,
    handleSendMessage,
    handleKeyDown,
    messagesEndRef,
  } = useAdminChat();

  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [isBlockBotSheetOpen, setIsBlockBotSheetOpen] = useState(false);
  const [selectedBlockOption, setSelectedBlockOption] = useState<string>("");
  const handleSelectSessionResponsive = (sessionId: string) => {
    handleSelectSession(sessionId);
  };
  const handleBackToSessions = () => {
    handleSelectSession(null as unknown as string);
  };
  console.log("Current Session Info:", currentSessionInfo);
  const InfoColumnContent = () => (
    <div className="flex flex-col gap-4 p-4 lg:p-0">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiên hỗ trợ</CardTitle>
          <CardDescription>
            {currentSessionInfo?.time ? (
              <Countdown
                targetDate={currentSessionInfo.time}
                onComplete={() => console.log("Bot duoc khoi dong lai")}
              />
            ) : (
              <span className="text-muted-foreground">Chưa có thời gian</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cán bộ đang tiếp nhận</Label>
            <Input
              value={
                currentSessionInfo?.current_receiver || "Chưa có cán bộ xử lý"
              }
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Cán bộ tiếp nhận trước đó</Label>
            <Input
              value={
                currentSessionInfo?.previous_receiver || "Chưa có cán bộ xử lý"
              }
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  const handleArchive = () => {
    setIsBlockBotSheetOpen(true);
  };

  const blockOptions = [
    { id: 1, value: "1h", label: "1 tiếng" },
    { id: 2, value: "4h", label: "4 tiếng" },
    { id: 3, value: "8am", label: "8h sáng mai" },
    { id: 4, value: "forever", label: "Chặn vĩnh viễn" },
  ];

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <div className="flex h-full w-full flex-row overflow-hidden">
        <div
          className={`
            ${currentSessionId ? "hidden" : "flex w-full"}
            h-full flex-shrink-0 flex-col border-r
            md:flex md:w-[300px]
          `}
        >
          <div className="flex h-full flex-col">
            <div className="p-3">
              <h2 className="text-lg font-semibold">Phiên chat</h2>
            </div>
            <div className="relative p-3">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phiên..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto px-2">
              <div className="flex flex-col gap-1">
                {isLoadingSessions ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <SessionItem
                      key={session.chat_session_id}
                      session={session}
                      isActive={session.chat_session_id === currentSessionId}
                      onClick={() =>
                        handleSelectSessionResponsive(session.chat_session_id)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`
            ${currentSessionId ? "flex w-full" : "hidden"}
            h-full flex-1 flex-col
            md:flex
          `}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center justify-between border-b p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={handleBackToSessions}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {currentSessionInfo
                    ? `Phiên: ${
                        currentSessionInfo.customer_name ||
                        currentSessionInfo.chat_session_id.slice(0, 8)
                      }`
                    : "Chọn một phiên chat"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled={!currentSessionId}
                  onClick={() => {
                    handleArchive();
                  }}
                  className="hidden sm:flex"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Thủ công
                </Button>

                <Sheet open={isInfoSheetOpen} onOpenChange={setIsInfoSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      disabled={!currentSessionId}
                    >
                      <PanelRight className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:w-[380px] p-0 overflow-y-auto">
                    <SheetHeader className="p-4">
                      <SheetTitle>Thông tin chi tiết</SheetTitle>
                    </SheetHeader>
                    <InfoColumnContent />
                  </SheetContent>
                </Sheet>

                <Sheet
                  open={isBlockBotSheetOpen}
                  onOpenChange={setIsBlockBotSheetOpen}
                >
                  <SheetContent className="w-full sm:w-[400px] p-6 flex flex-col justify-between">
                    <div>
                      <SheetHeader>
                        <SheetTitle className="text-lg font-semibold text-gray-800">
                          🛑 Chặn Bot
                        </SheetTitle>
                        <p className="text-sm text-gray-500">
                          Chọn phạm vi chặn bot để bảo vệ hệ thống của bạn.
                        </p>
                      </SheetHeader>

                      <div className="mt-6">
                        <RadioGroupSetting
                          value={selectedBlockOption}
                          onValueChange={setSelectedBlockOption}
                          options={blockOptions}
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsBlockBotSheetOpen(false)}
                        className="rounded-xl"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={async () => {
                          const res = await updateChatSessionStatus(
                            currentSessionId!,
                            "false",
                            selectedBlockOption
                          );
                          if (res.id) {
                            toast.success("Chặn bot thành công!");
                            setIsBlockBotSheetOpen(false);
                          } else {
                            toast.error("Chặn bot thất bại. Vui lòng thử lại.");
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                      >
                        Xác nhận chặn
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">
                      Đang tải tin nhắn...
                    </span>
                  </div>
                ) : !currentSessionId ? (
                  <div className="text-center text-muted-foreground p-8 md:hidden">
                    Vui lòng chọn một phiên chat từ danh sách bên trái.
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <MessageItem key={msg.id || index} msg={msg} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <Separator />

            <div className="p-4">
              <div className="relative">
                <Textarea
                  placeholder={
                    currentSessionId
                      ? "Nhập tin nhắn..."
                      : "Vui lòng chọn phiên chat..."
                  }
                  className="pr-28 min-h-[60px]"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!currentSessionId || isLoadingMessages}
                />
                <div className="absolute right-3 top-3 flex gap-2">
                  <Button variant="ghost" size="icon" disabled>
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Đính kèm</span>
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !currentSessionId}
                  >
                    <SendHorizontal className="h-4 w-4" />
                    <span className="sr-only">Gửi</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden h-full w-[350px] flex-shrink-0 flex-col border-l lg:flex">
          <div className="h-full overflow-y-auto">
            <InfoColumnContent />
          </div>
        </div>
      </div>
    </div>
  );
}
