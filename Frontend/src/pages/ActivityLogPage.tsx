// src/components/pages/ActivityLogPage.jsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown } from "lucide-react";

// Mock data cho log
const mockLogs = [
  {
    id: "log_001",
    timestamp: "2025-11-02 17:01:00",
    user: "user_123",
    action: "MESSAGE_SENT",
    channel: "Facebook",
    details: "Nội dung: 'Tôi cần hỗ trợ'",
  },
  {
    id: "log_002",
    timestamp: "2025-11-02 17:01:05",
    user: "bot_service",
    action: "BOT_REPLIED",
    channel: "Facebook",
    details: "Trả lời tự động: 'Chào bạn...'",
  },
  {
    id: "log_003",
    timestamp: "2025-11-02 17:02:15",
    user: "admin_01",
    action: "CHANNEL_UPDATE",
    channel: "Zalo",
    details: "Cập nhật tên kênh 'Zalo OA 1'",
  },
  {
    id: "log_004",
    timestamp: "2025-11-02 17:03:00",
    user: "user_456",
    action: "MESSAGE_SENT",
    channel: "Zalo",
    details: "Nội dung: 'Gửi hình ảnh'",
  },
];

// Hàm helper để tạo màu cho badge
const getBadgeVariant = (action: string) => {
  switch (action) {
    case "MESSAGE_SENT":
      return "default";
    case "BOT_REPLIED":
      return "secondary";
    case "CHANNEL_UPDATE":
      return "destructive";
    default:
      return "outline";
  }
};

export default function ActivityLogPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Thống kê Hoạt động
        </h2>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Xuất CSV
        </Button>
      </div>

      <div className="pb-4">
        <Input
          placeholder="Lọc theo người dùng, hành động..."
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Chi Tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người dùng/Dịch vụ</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.channel}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
