// @/components/ClientChatUI.tsx
"use client";

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
    Paperclip,
    SendHorizontal,
    Bot,
    UserCircle2,
    Home,
    FileSearch,
    HelpCircle,
    FileText,
} from "lucide-react";
import type { MessageData } from "@/types/message";

// --- TIỆN ÍCH ---

/**
 * Helper để định dạng thời gian (ví dụ: "10:32")
 */
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
        return "vừa xong"; // Fallback
    }
};

// --- COMPONENT TIN NHẮN ---

type MessageItemProps = {
    msg: MessageData;
};

export const MessageItem: React.FC<MessageItemProps> = ({ msg }) => {
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

    // 2. Thử phân tích (parse) msg.content
    try {
        const parsed = JSON.parse(msg.content);

        // 3. Nếu phân tích thành công VÀ có thuộc tính 'message'
        if (parsed && parsed.message) {
            displayContent = parsed.message;
        } else {
            // Là JSON nhưng không có 'message', hiển thị nguyên bản
            displayContent = msg.content;
        }
    } catch (error) {
        // 4. Nếu phân tích lỗi (tức là nó chỉ là text bình thường "hihi")
        displayContent = msg.content;
    }
    console.log("Rendering message from", msg);
    const getSenderName = () => {
        if (isBot) return "Bot Hỗ trợ";
        // Hiển thị tên Cán bộ nếu có, nếu không thì hiển thị "Cán bộ Hỗ trợ"
        if (isAdmin) return `Cán bộ: ${msg.sender_type || "Hỗ trợ viên"}`;
        return null; // Không hiển thị tên cho customer
    };

    // Tin nhắn của Công dân (Người dùng) - Căn lề phải
    if (isCustomer) {
        return (
            <div className="flex items-start gap-3 justify-end">
                <div className="rounded-lg bg-primary text-primary-foreground p-3 max-w-[75%] text-left">
                    <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
                    {msg.image && Array.isArray(msg.image) && msg.image.length > 0 && (
                        <img
                            src={msg.image[0]} /* Lấy ảnh ĐẦU TIÊN trong mảng */
                            alt="Hình ảnh nhận được"
                            className="mt-2 rounded-md max-w-xs"
                        />
                    )}
                    <span className="text-xs text-primary-foreground/80 block text-right mt-1">
                        {formatTime(msg.created_at)}
                    </span>
                </div>
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                </Avatar>
            </div>
        );
    }

    // Tin nhắn của Bot hoặc Admin - Căn lề trái
    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
            </Avatar>
            <div className="rounded-lg bg-muted p-3 max-w-[75%]">
                <p className="text-sm font-semibold mb-1">{getSenderName()}</p>
                <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
                {msg.image && Array.isArray(msg.image) && msg.image.length > 0 && (
                    <img
                        src={msg.image[0]} /* Lấy ảnh ĐẦU TIÊN trong mảng */
                        alt="Hình ảnh nhận được"
                        className="mt-2 rounded-md max-w-xs"
                    />
                )}
                <span className="text-xs text-muted-foreground block text-left mt-1">
                    {formatTime(msg.created_at)}
                </span>
            </div>
        </div>
    );
};

// --- COMPONENT CỘT 1: SIDEBAR ---

export const Sidebar: React.FC = () => {
    return (
        <div className="flex h-full flex-col border-r bg-muted/40 p-4">
            <div className="flex h-14 items-center mb-4">
                <h1 className="text-xl font-bold">Dịch Vụ Công</h1>
            </div>
            <nav className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Trang chủ
                </Button>
                <Button variant="ghost" className="justify-start">
                    <FileSearch className="mr-2 h-4 w-4" />
                    Tra cứu hồ sơ
                </Button>
                <Button variant="secondary" className="justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Hỗ trợ trực tuyến
                </Button>
            </nav>
        </div>
    );
};

// --- COMPONENT CỘT 3: SUPPORT PANEL ---

export const SupportPanel: React.FC = () => {
    return (
        <ScrollArea className="h-full p-4">
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="text-center space-y-2 pb-4 border-b">
                    <h3 className="text-lg font-semibold">Hỗ trợ & Thông tin</h3>
                    <p className="text-sm text-muted-foreground">
                        Tài liệu và câu hỏi thường gặp để hỗ trợ bạn
                    </p>
                </div>

                {/* FAQ Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Câu hỏi thường gặp
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm">
                                    Làm lại giấy khai sinh mất bao lâu?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground">
                                    Thời gian giải quyết là 01 ngày làm việc kể từ khi nhận đủ hồ
                                    sơ hợp lệ.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-sm">
                                    Cần mang theo giấy tờ gì?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground">
                                    CMND/CCCD gốc, giấy tờ chứng minh quan hệ gia đình (nếu làm
                                    cho con), và giấy xác nhận của địa phương nơi sinh.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-sm">
                                    Lệ phí là bao nhiêu?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground">
                                    Lệ phí là 8.000 VNĐ theo quy định hiện hành.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-sm">
                                    Có thể làm online không?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground">
                                    Hiện tại chưa hỗ trợ làm online. Bạn cần đến trực tiếp cơ quan
                                    có thẩm quyền.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Documents Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Tài liệu tham khảo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <FileText className="mr-2 h-3 w-3" />
                            Mẫu đơn TK-01 (Làm lại GKS)
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <FileText className="mr-2 h-3 w-3" />
                            Hướng dẫn chi tiết thủ tục
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <FileText className="mr-2 h-3 w-3" />
                            Danh sách cơ quan tiếp nhận
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <FileText className="mr-2 h-3 w-3" />
                            Biểu phí lệ phí mới nhất
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Liên kết nhanh
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <FileSearch className="mr-2 h-3 w-3" />
                            Tra cứu tiến độ hồ sơ
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <UserCircle2 className="mr-2 h-3 w-3" />
                            Đánh giá dịch vụ
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                        >
                            <Bot className="mr-2 h-3 w-3" />
                            Phản hồi & Góp ý
                        </Button>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                        <div className="flex items-start gap-2">
                            <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Phòng Tư pháp - Hộ tịch</div>
                                <div className="text-muted-foreground">UBND Thành phố</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Hotline: 1900-1234</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Email: hotro@hcc.gov.vn
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
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

// --- COMPONENT HEADER KHUNG CHAT ---

type ChatHeaderProps = {
    isConnecting: boolean;
    botName?: string;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    isConnecting,
    botName,
}) => {
    return (
        <div className="flex h-14 items-center gap-3 border-b px-4">
            <Avatar>
                <AvatarFallback>
                    <Bot />
                </AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-lg font-semibold">
                    {botName || "Hỗ trợ Dịch vụ công"}
                </h2>
                <span className="text-sm text-muted-foreground">
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
    sessionId: string | null;
};

export const ChatInput: React.FC<ChatInputProps> = ({
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleKeyDown,
    isConnecting,
    sessionId,
}) => {
    return (
        <div className="p-4">
            <div className="relative mx-auto max-w-3xl">
                <Textarea
                    placeholder={
                        isConnecting ? "Đang kết nối..." : "Nhập câu hỏi của bạn..."
                    }
                    className="pr-28 min-h-[60px]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isConnecting || !sessionId}
                />
                <div className="absolute right-3 top-3 flex gap-2">
                    <Button variant="ghost" size="icon" disabled>
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Đính kèm tệp (Chưa hỗ trợ)</span>
                    </Button>
                    <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isConnecting || !sessionId}
                    >
                        <SendHorizontal className="h-4 w-4" />
                        <span className="sr-only">Gửi</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
