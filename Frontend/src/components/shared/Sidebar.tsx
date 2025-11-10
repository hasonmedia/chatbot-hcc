import {
  BookUser,
  MessageSquare,
  Settings,
  Home,
  PackageIcon,
  User2Icon,
  BookAlert,
  ChartBar,
  LogOut,
  FolderKanban,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Logo } from "../ui/shadcn-io/navbar-01";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const items = [
  {
    title: "Trang quản lý",
    icon: Home,
    url: "/trang-chu",
    roles: ["root", "superadmin", "admin", "user"], // Tất cả roles
  },
  {
    title: "Cấu hình hệ thống",
    icon: Settings,
    url: "/cau-hinh-he-thong",
    roles: ["root", "superadmin"], // Chỉ root và superadmin
  },
  {
    title: "Quản lý người dùng",
    icon: User2Icon,
    url: "/quan-ly-nguoi-dung",
    roles: ["root", "superadmin", "admin"], // root, superadmin, admin
  },
  {
    title: "Dữ liệu Chatbot",
    icon: BookUser,
    url: "/du-lieu-chatbot",
    roles: ["root", "superadmin", "admin"], // root, superadmin, admin
  },
  {
    title: "Quản lý danh mục",
    icon: FolderKanban,
    url: "/quan-ly-danh-muc",
    roles: ["root", "superadmin", "admin"], // root, superadmin, admin
  },
  {
    title: "Quản lý kênh",
    icon: PackageIcon,
    url: "/quan-ly-kenh",
    roles: ["root", "superadmin", "admin"], // root, superadmin, admin
  },
  {
    title: "Chat Interface",
    icon: MessageSquare,
    url: "/quan-ly-chat",
    roles: ["root", "superadmin", "admin", "user"], // Tất cả roles
  },
  {
    title: "Thống kê",
    icon: ChartBar,
    url: "/thong-ke",
    roles: ["root", "superadmin", "admin"], // root, superadmin, admin
  },
  {
    title: "Thống kê hoạt động",
    icon: ChartBar,
    url: "/thong-ke-hoat-dong",
    roles: ["root", "superadmin", "admin"], // root, superadmin, admin
  },
  {
    title: "Hướng dẫn sử dụng",
    icon: BookAlert,
    url: "/huong-dan-su-dung",
    roles: ["root", "superadmin", "admin", "user"], // Tất cả roles
  },
];

export function AppSidebar() {
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    setIsLogoutDialogOpen(false);
    navigate("/");
  };

  const filteredItems = items.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="border-b-2 flex items-center p-3">
          <Logo />

          <span
            className={cn(
              "font-semibold text-lg ml-3 whitespace-nowrap transition-opacity duration-200",
              "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
              "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden"
            )}
          >
            Chatbot Hành Chính Công
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-opacity duration-200",
                          "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
                          "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden"
                        )}
                      >
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarContent>
        <SidebarFooter>
          <Dialog
            open={isLogoutDialogOpen}
            onOpenChange={setIsLogoutDialogOpen}
          >
            <DialogTrigger asChild>
              <SidebarMenuButton className="w-full">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-opacity duration-200",
                      "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
                      "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden"
                    )}
                  >
                    Đăng xuất
                  </span>
                </div>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận đăng xuất</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
