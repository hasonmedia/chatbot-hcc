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

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLogoutDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Vẫn navigate về login page ngay cả khi logout API thất bại
      setIsLogoutDialogOpen(false);
      navigate("/");
    }
  };

  const filteredItems = items.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r">
        <SidebarHeader className="border-b-2 flex items-center p-2 sm:p-3">
          <div className="shrink-0">
            <Logo />
          </div>

          <span
            className={cn(
              "font-semibold text-sm sm:text-base lg:text-lg ml-2 sm:ml-3 whitespace-nowrap transition-opacity duration-200 min-w-0 truncate",
              "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
              "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden"
            )}
          >
            Chatbot Hành Chính Công
          </span>
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-9 sm:h-10">
                    <a
                      href={item.url}
                      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3"
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-opacity duration-200 text-sm sm:text-base min-w-0 truncate",
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
        <SidebarFooter className="p-2">
          <Dialog
            open={isLogoutDialogOpen}
            onOpenChange={setIsLogoutDialogOpen}
          >
            <DialogTrigger asChild>
              <SidebarMenuButton className="w-full h-9 sm:h-10">
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-opacity duration-200 text-sm sm:text-base min-w-0 truncate",
                      "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
                      "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden"
                    )}
                  >
                    Đăng xuất
                  </span>
                </div>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Xác nhận đăng xuất
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsLogoutDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={handleLogout}
                >
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
