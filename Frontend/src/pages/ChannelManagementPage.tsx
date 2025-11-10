import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, MessageCircle, PlusCircle } from "lucide-react"; // Giả sử 'MessageCircle' là Zalo

// Mock data cho các kênh
const mockChannels = [
  {
    id: 1,
    name: "Fanpage Bán Hàng 1",
    platform: "facebook",
    status: "connected",
    active: true,
    avatar: "/icons/facebook.png",
    fallback: "FB",
  },
  {
    id: 2,
    name: "Zalo OA Chăm Sóc Khách Hàng",
    platform: "zalo",
    status: "connected",
    active: false,
    avatar: "/icons/zalo.png",
    fallback: "ZL",
  },
  {
    id: 3,
    name: "Fanpage Tin Tức",
    platform: "facebook",
    status: "disconnected",
    active: false,
    avatar: "/icons/facebook.png",
    fallback: "FB",
  },
];

// Helper để lấy Icon
const PlatformIcon = ({ platform, ...props }: any) => {
  if (platform === "facebook") {
    return <Facebook {...props} />;
  }
  if (platform === "zalo") {
    // Thay thế bằng icon Zalo nếu có
    return <MessageCircle {...props} />;
  }
  return null;
};

export default function ChannelManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Kênh</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm kênh mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockChannels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={channel.avatar} />
                  <AvatarFallback>
                    <PlatformIcon
                      platform={channel.platform}
                      className="h-5 w-5"
                    />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{channel.name}</CardTitle>
              </div>
              <Badge
                variant={
                  channel.status === "connected" ? "default" : "destructive"
                }
              >
                {channel.status === "connected" ? "Đã kết nối" : "Đã ngắt"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Kênh {channel.platform} này đang{" "}
                {channel.active ? "hoạt động" : "tạm dừng"}.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cài đặt</Button>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`active-toggle-${channel.id}`}
                  checked={channel.active}
                  disabled={channel.status === "disconnected"}
                />
                <Label htmlFor={`active-toggle-${channel.id}`}>Hoạt động</Label>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
