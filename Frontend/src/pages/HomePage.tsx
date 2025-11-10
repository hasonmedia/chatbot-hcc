import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Network, Activity } from "lucide-react";

const recentActivities = [
  {
    id: 1,
    user: { name: "Nguyễn Văn A", fallback: "A" },
    action: "đã gửi tin nhắn",
    channel: "Facebook",
    time: "1 phút trước",
  },
  {
    id: 2,
    user: { name: "Trần Thị B", fallback: "B" },
    action: "đã kết nối kênh",
    channel: "Zalo",
    time: "15 phút trước",
  },
  {
    id: 3,
    user: { name: "Bot", fallback: "BOT" },
    action: "đã trả lời tự động",
    channel: "Facebook",
    time: "20 phút trước",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Dashboard
      </h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tin nhắn đã xử lý
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+50,430</div>
            <p className="text-xs text-muted-foreground">+12% so với hôm qua</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kênh hoạt động
            </CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 Facebook, 2 Zalo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ phản hồi
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-xs text-muted-foreground">Phản hồi tự động</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Các hoạt động mới nhất trên hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0"
            >
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={`/avatars/${activity.id}.png`}
                    alt="Avatar"
                  />
                  <AvatarFallback>{activity.user.fallback}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto sm:ml-4">
                <Badge variant="outline">{activity.channel}</Badge>
                <div className="text-sm text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
