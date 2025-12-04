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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Paperclip,
  SendHorizontal,
  Archive,
  Loader2,
  ArrowLeft,
  PanelRight,
  Trash2,
  MoreHorizontal,
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
    deleteChatSessions,
    deleteMessages,
    messagesEndRef,
  } = useAdminChat();

  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [isBlockBotSheetOpen, setIsBlockBotSheetOpen] = useState(false);
  const [selectedBlockOption, setSelectedBlockOption] = useState<string>("");
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] =
    useState(false);
  const [isDeleteMessagesDialogOpen, setIsDeleteMessagesDialogOpen] =
    useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [isSessionSelectionMode, setIsSessionSelectionMode] = useState(false);
  const handleSelectSessionResponsive = (sessionId: number) => {
    handleSelectSession(sessionId);
  };
  const handleBackToSessions = () => {
    handleSelectSession(null);
  };
  const InfoColumnContent = () => (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 lg:p-0">
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            Thông tin phiên hỗ trợ
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
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
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Cán bộ đang tiếp nhận
            </Label>
            <Input
              value={
                currentSessionInfo?.current_receiver || "Chưa có cán bộ xử lý"
              }
              disabled
              className="text-xs sm:text-sm h-8 sm:h-9"
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Cán bộ tiếp nhận trước đó
            </Label>
            <Input
              value={
                currentSessionInfo?.previous_receiver || "Chưa có cán bộ xử lý"
              }
              disabled
              className="text-xs sm:text-sm h-8 sm:h-9"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  const handleArchive = () => {
    setIsBlockBotSheetOpen(true);
  };

  const handleDeleteSession = async () => {
    const sessionsToDelete =
      selectedSessions.length > 0
        ? selectedSessions
        : [currentSessionId].filter(Boolean);
    if (sessionsToDelete.length === 0) return;
    const result = await deleteChatSessions(sessionsToDelete as number[]);

    if (result.success) {
      toast.success(`Xóa ${result.count} phiên chat thành công!`);
      setSelectedSessions([]);
      setIsSessionSelectionMode(false);
    } else {
      toast.error(result.error || "Xóa phiên chat thất bại!");
    }

    setIsDeleteSessionDialogOpen(false);
  };

  const handleDeleteMessages = async () => {
    if (!currentSessionId || selectedMessages.length === 0) return;

    const result = await deleteMessages(selectedMessages);

    if (result.success) {
      toast.success(`Xóa ${result.count} tin nhắn thành công!`);
      setSelectedMessages([]);
      setIsSelectionMode(false);
    } else {
      toast.error(result.error || "Xóa tin nhắn thất bại!");
    }

    setIsDeleteMessagesDialogOpen(false);
  };

  const handleSelectAllSessions = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(
        filteredSessions.map((session) => session.chat_session_id)
      );
    }
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
            h-full shrink-0 flex-col border-r
            md:flex md:w-[280px] lg:w-[300px] xl:w-[320px]
          `}
        >
          <div className="flex h-full flex-col">
            <div className="p-2 sm:p-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold">
                  Phiên chat
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSessionSelectionMode(!isSessionSelectionMode);
                    setSelectedSessions([]);
                  }}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  {isSessionSelectionMode ? "Hủy" : "Chọn"}
                </Button>
              </div>

              {isSessionSelectionMode && (
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllSessions}
                    className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                  >
                    {selectedSessions.length === filteredSessions.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </Button>

                  {selectedSessions.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDeleteSessionDialogOpen(true)}
                      className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Xóa ({selectedSessions.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="relative p-2 sm:p-3">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phiên..."
                className="pl-6 sm:pl-8 text-xs sm:text-sm h-8 sm:h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2">
              <div className="flex flex-col gap-1">
                {isLoadingSessions ? (
                  <div className="flex justify-center items-center p-3 sm:p-4">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.chat_session_id}
                      className="relative min-w-0"
                    >
                      {isSessionSelectionMode && (
                        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 z-10 bg-white/90 rounded p-0.5">
                          <Checkbox
                            checked={selectedSessions.includes(
                              session.chat_session_id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSessions((prev) => [
                                  ...prev,
                                  session.chat_session_id,
                                ]);
                              } else {
                                setSelectedSessions((prev) =>
                                  prev.filter(
                                    (id) => id !== session.chat_session_id
                                  )
                                );
                              }
                            }}
                            className="w-3 h-3 sm:w-4 sm:h-4"
                          />
                        </div>
                      )}
                      <div
                        className={`${
                          isSessionSelectionMode &&
                          selectedSessions.includes(session.chat_session_id)
                            ? "bg-blue-50 border-blue-200 border"
                            : ""
                        } rounded-lg transition-colors min-w-0`}
                        onClick={() => {
                          if (!isSessionSelectionMode) {
                            handleSelectSessionResponsive(
                              session.chat_session_id
                            );
                          }
                        }}
                      >
                        <div className="min-w-0 overflow-hidden">
                          <SessionItem
                            session={session}
                            isActive={
                              session.chat_session_id === currentSessionId
                            }
                            onClick={() => {}} // Empty onClick as we handle it in parent div
                          />
                        </div>
                      </div>
                    </div>
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
            {/* Fixed Header */}
            <div className="shrink-0 flex h-14 items-center justify-between border-b p-3 bg-white z-10">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  onClick={handleBackToSessions}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold truncate">
                  {currentSessionInfo
                    ? `Phiên: ${
                        currentSessionInfo.customer_name ||
                        currentSessionInfo.chat_session_id
                      }`
                    : "Chọn một phiên chat"}
                </h3>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  disabled={!currentSessionId}
                  onClick={() => {
                    handleArchive();
                  }}
                  className="hidden sm:flex text-xs lg:text-sm"
                >
                  <Archive className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Thủ công
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!currentSessionId}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedSessions([currentSessionId as number]);
                        setIsDeleteSessionDialogOpen(true);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa phiên này
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        setSelectedMessages([]);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isSelectionMode ? "Hủy chọn" : "Xóa tin nhắn"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Sheet open={isInfoSheetOpen} onOpenChange={setIsInfoSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden h-8 w-8 sm:h-9 sm:w-9"
                      disabled={!currentSessionId}
                    >
                      <PanelRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:w-[380px] p-0 overflow-y-auto">
                    <SheetHeader className="p-3 sm:p-4">
                      <SheetTitle className="text-sm sm:text-base">
                        Thông tin chi tiết
                      </SheetTitle>
                    </SheetHeader>
                    <InfoColumnContent />
                  </SheetContent>
                </Sheet>

                <Sheet
                  open={isBlockBotSheetOpen}
                  onOpenChange={setIsBlockBotSheetOpen}
                >
                  <SheetContent className="w-full sm:w-[400px] p-4 sm:p-6 flex flex-col justify-between">
                    <div>
                      <SheetHeader>
                        <SheetTitle className="text-base sm:text-lg font-semibold text-gray-800">
                          🛑 Chặn Bot
                        </SheetTitle>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Chọn phạm vi chặn bot để bảo vệ hệ thống của bạn.
                        </p>
                      </SheetHeader>

                      <div className="mt-4 sm:mt-6">
                        <RadioGroupSetting
                          value={selectedBlockOption}
                          onValueChange={setSelectedBlockOption}
                          options={blockOptions}
                        />
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex justify-end gap-2 sm:gap-3 border-t pt-3 sm:pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsBlockBotSheetOpen(false)}
                        className="rounded-xl text-xs sm:text-sm"
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
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm"
                      >
                        Xác nhận chặn
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Selection Bar - Sticky */}
            {isSelectionMode && selectedMessages.length > 0 && (
              <div className="shrink-0 bg-blue-50 border-b border-blue-200 p-2 sm:p-3 z-10">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
                  <span className="text-blue-700 text-xs sm:text-sm text-center sm:text-left font-medium">
                    Đã chọn {selectedMessages.length} tin nhắn
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1 sm:flex-none"
                      onClick={() => {
                        setSelectedMessages([]);
                        setIsSelectionMode(false);
                      }}
                    >
                      Hủy chọn
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs flex-1 sm:flex-none"
                      onClick={() => setIsDeleteMessagesDialogOpen(true)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Xóa đã chọn
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center p-6 sm:p-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground text-sm sm:text-base">
                      Đang tải tin nhắn...
                    </span>
                  </div>
                ) : !currentSessionId ? (
                  <div className="text-center text-muted-foreground p-6 sm:p-8 md:hidden">
                    <div className="text-xl sm:text-2xl mb-3">💬</div>
                    <p className="text-sm sm:text-base">
                      Vui lòng chọn một phiên chat từ danh sách bên trái.
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground p-6 sm:p-8">
                    <div className="text-xl sm:text-2xl mb-3">📝</div>
                    <p className="text-sm sm:text-base">
                      Phiên chat này chưa có tin nhắn nào.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`relative min-w-0 ${
                        isSelectionMode ? "cursor-pointer" : ""
                      }`}
                      onClick={() => {
                        // Không làm gì khi click vào message trong selection mode
                        // Chỉ checkbox mới handle selection
                      }}
                    >
                      {isSelectionMode && (
                        <div className="absolute bottom-2 left-2 z-10 bg-white/90 rounded p-0.5">
                          <Checkbox
                            checked={
                              msg.id ? selectedMessages.includes(msg.id) : false
                            }
                            onCheckedChange={(checked) => {
                              if (msg.id) {
                                setSelectedMessages((prev) =>
                                  checked
                                    ? [...prev, msg.id!]
                                    : prev.filter((id) => id !== msg.id!)
                                );
                              }
                            }}
                            className="w-4 h-4 sm:w-3 sm:h-3"
                          />
                        </div>
                      )}
                      <div
                        className={`${
                          isSelectionMode &&
                          msg.id &&
                          selectedMessages.includes(msg.id)
                            ? "bg-blue-50 border-blue-200 border"
                            : ""
                        } rounded-lg transition-colors min-w-0 overflow-hidden`}
                      >
                        <MessageItem msg={msg} />
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

            {/* Fixed Input Area */}
            <div className="shrink-0 border-t bg-white">
              <div className="p-3 sm:p-4">
                <div className="relative">
                  <Textarea
                    placeholder={
                      currentSessionId
                        ? "Nhập tin nhắn..."
                        : "Vui lòng chọn phiên chat..."
                    }
                    className="pr-20 sm:pr-28 min-h-[50px] sm:min-h-[60px] text-sm sm:text-base resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!currentSessionId || isLoadingMessages}
                  />
                  <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="sr-only">Đính kèm</span>
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !currentSessionId}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <SendHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="sr-only">Gửi</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Dialog for Delete Session */}
          <AlertDialog
            open={isDeleteSessionDialogOpen}
            onOpenChange={setIsDeleteSessionDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sm sm:text-base">
                  Xác nhận xóa phiên chat
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm">
                  {selectedSessions.length > 1
                    ? `Bạn có chắc chắn muốn xóa ${selectedSessions.length} phiên chat đã chọn?`
                    : "Bạn có chắc chắn muốn xóa phiên chat này?"}{" "}
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs sm:text-sm">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSession}
                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Alert Dialog for Delete Messages */}
          <AlertDialog
            open={isDeleteMessagesDialogOpen}
            onOpenChange={setIsDeleteMessagesDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sm sm:text-base">
                  Xác nhận xóa tin nhắn
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm">
                  Bạn có chắc chắn muốn xóa {selectedMessages.length} tin nhắn
                  đã chọn? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs sm:text-sm">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteMessages}
                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="hidden h-full w-[280px] xl:w-[350px] shrink-0 flex-col border-l lg:flex">
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <InfoColumnContent />
          </div>
        </div>
      </div>
    </div>
  );
}
