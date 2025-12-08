import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SendHorizontal,
  Bot,
  UserCircle2,
  Home,
  FileSearch,
  HelpCircle,
  FileText,
  ChartBarBig,
} from "lucide-react";
import type { MessageItemProps } from "@/types/message";
import { formatTime } from "@/lib/formatDateTime";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export const MessageItem: React.FC<MessageItemProps> = ({ msg, botName }) => {
  const isCustomer = msg.sender_type === "customer";
  const isBot = msg.sender_type === "bot";
  const isAdmin = msg.sender_type === "admin";
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
    const parsed = JSON.parse(msg.content);
    if (parsed && parsed.message) {
      displayContent = parsed.message;
    }
    if (parsed && parsed.links && Array.isArray(parsed.links)) {
      links = parsed.links || [];
    }
  } catch (error) {
    displayContent = msg.content;
  }
  const getSenderName = () => {
    if (isBot) return botName || "Bot hỗ trợ";
    if (isAdmin) return `Cán bộ: ${msg.sender_type || "Hỗ trợ viên"}`;
    return null;
  };
  if (isCustomer) {
    return (
      <div className="flex items-start gap-2 sm:gap-3 justify-end">
        <div className="rounded-lg bg-primary text-primary-foreground p-2 sm:p-3 max-w-[85%] sm:max-w-[75%] text-left">
          <div className="text-sm sm:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 underline hover:text-blue-100 wrap-break-word"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                p: ({ children }) => (
                  <p className="wrap-break-word">{children}</p>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
          {links.length > 0 && (
            <div className="mt-2 pt-2 border-t border-primary-foreground/20">
              <ul className="list-none p-0 m-0 space-y-1">
                {links.map((link, index) => (
                  <li key={index} className="text-xs sm:text-sm">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-200 underline hover:text-blue-100 block break-all"
                      title={link}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <span className="text-xs text-primary-foreground/80 block text-right mt-1">
            {formatTime(msg.created_at)}
          </span>
        </div>
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-muted p-2 sm:p-3 max-w-[85%] sm:max-w-[75%] min-w-0">
        <p className="text-xs sm:text-sm font-semibold mb-1 truncate">
          {getSenderName()}
        </p>
        <div className="text-sm sm:text-base">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 wrap-break-word"
                  {...props}
                >
                  {children}
                </a>
              ),
              p: ({ children }) => (
                <p className="wrap-break-word">{children}</p>
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
        {links.length > 0 && (
          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
            <ul className="list-none p-0 m-0 space-y-1">
              {links.map((link, index) => (
                <li key={index} className="text-xs sm:text-sm">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 block break-all"
                    title={link}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {msg.image && Array.isArray(msg.image) && msg.image.length > 0 && (
          <img
            src={msg.image[0]}
            alt="Hình ảnh nhận được"
            className="mt-2 rounded-md max-w-full sm:max-w-xs h-auto"
          />
        )}
        <span className="text-xs text-muted-foreground block text-left mt-1">
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-muted/40 p-3 lg:p-4">
      <div className="flex h-12 lg:h-14 items-center mb-3 lg:mb-4">
        <h1 className="text-lg lg:text-xl font-bold truncate">Dịch Vụ Công</h1>
      </div>
      <nav className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start text-sm lg:text-base h-9 lg:h-10"
          onClick={() => {
            navigate("/");
          }}
        >
          <Home className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Trang chủ</span>
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-sm lg:text-base h-9 lg:h-10"
          onClick={() => navigate("/chat")}
        >
          <ChartBarBig className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Chat hỗ trợ</span>
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-sm lg:text-base h-9 lg:h-10"
          onClick={() => navigate("/huong-dan")}
        >
          <HelpCircle className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Hỗ trợ trực tuyến</span>
        </Button>
      </nav>
    </div>
  );
};

export const SupportPanel: React.FC = () => {
  return (
    <ScrollArea className="h-full p-2 sm:p-3 lg:p-4">
      <div className="flex flex-col gap-3 lg:gap-4">
        {/* Header */}
        <div className="text-center space-y-1 lg:space-y-2 pb-3 lg:pb-4 border-b">
          <h3 className="text-base lg:text-lg font-semibold">
            Hỗ trợ & Thông tin
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Tài liệu và câu hỏi thường gặp để hỗ trợ bạn
          </p>
        </div>

        {/* FAQ Card */}
        <Card>
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <HelpCircle className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
              Câu hỏi thường gặp
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xs lg:text-sm py-2">
                  Làm lại giấy khai sinh mất bao lâu?
                </AccordionTrigger>
                <AccordionContent className="text-xs lg:text-sm text-muted-foreground">
                  Thời gian giải quyết là 01 ngày làm việc kể từ khi nhận đủ hồ
                  sơ hợp lệ.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xs lg:text-sm py-2">
                  Cần mang theo giấy tờ gì?
                </AccordionTrigger>
                <AccordionContent className="text-xs lg:text-sm text-muted-foreground">
                  CMND/CCCD gốc, giấy tờ chứng minh quan hệ gia đình (nếu làm
                  cho con), và giấy xác nhận của địa phương nơi sinh.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xs lg:text-sm py-2">
                  Lệ phí là bao nhiêu?
                </AccordionTrigger>
                <AccordionContent className="text-xs lg:text-sm text-muted-foreground">
                  Lệ phí là 8.000 VNĐ theo quy định hiện hành.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-xs lg:text-sm py-2">
                  Có thể làm online không?
                </AccordionTrigger>
                <AccordionContent className="text-xs lg:text-sm text-muted-foreground">
                  Hiện tại chưa hỗ trợ làm online. Bạn cần đến trực tiếp cơ quan
                  có thẩm quyền.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card>
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
              Tài liệu tham khảo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 lg:space-y-2 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <FileText className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Mẫu đơn TK-01 (Làm lại GKS)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <FileText className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Hướng dẫn chi tiết thủ tục</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <FileText className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Danh sách cơ quan tiếp nhận</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <FileText className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Biểu phí lệ phí mới nhất</span>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
              <Home className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
              Liên kết nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 lg:space-y-2 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <FileSearch className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Tra cứu tiến độ hồ sơ</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <UserCircle2 className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Đánh giá dịch vụ</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs lg:text-sm h-8 lg:h-9"
            >
              <Bot className="mr-2 h-3 w-3 shrink-0" />
              <span className="truncate">Phản hồi & Góp ý</span>
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-2 lg:pb-4">
            <CardTitle className="text-sm lg:text-base">
              Thông tin liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 lg:space-y-3 text-xs lg:text-sm pt-0">
            <div className="flex items-start gap-2">
              <FileText className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="font-medium">Phòng Tư pháp - Hộ tịch</div>
                <div className="text-muted-foreground">UBND Thành phố</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground wrap-break-word">
                Hotline: 0236 3 507 507
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground wrap-break-word">
                Email: lienhe@hasontech.com
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                Giờ làm việc: 7:30 - 17:00
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

type ChatHeaderProps = {
  isConnecting: boolean;
  botName?: string;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isConnecting,
  botName,
}) => {
  return (
    <div className="flex h-12 sm:h-14 items-center gap-2 sm:gap-3 border-b px-2 sm:px-4 shrink-0">
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
        <AvatarFallback>
          <Bot />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold truncate">
          {botName || "Hỗ trợ Dịch vụ công"}
        </h2>
        <span className="text-xs sm:text-sm text-muted-foreground truncate block">
          {isConnecting ? "Đang kết nối..." : "Trạng thái: Đang hoạt động"}
        </span>
      </div>
    </div>
  );
};

// --- COMPONENT KHUNG NHẬP CHAT ---

type ChatInputProps = {
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isConnecting: boolean;
  isWaitingBot: boolean;
  sessionId: string | null;
};

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyDown,
  isConnecting,
  isWaitingBot,
  sessionId,
}) => {
  return (
    <div className="p-2 sm:p-4 shrink-0">
      <div className="relative w-full">
        <Textarea
          placeholder={
            isConnecting
              ? "Đang kết nối..."
              : isWaitingBot
              ? "Đang chờ phản hồi..."
              : "Nhập câu hỏi của bạn..."
          }
          className="pr-16 sm:pr-20 lg:pr-28 min-h-[50px] sm:min-h-[60px] text-sm sm:text-base resize-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isConnecting || !sessionId || isWaitingBot}
        />
        <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex gap-1 sm:gap-2">
          <Button
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || isConnecting || !sessionId || isWaitingBot
            }
          >
            <SendHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Gửi</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
