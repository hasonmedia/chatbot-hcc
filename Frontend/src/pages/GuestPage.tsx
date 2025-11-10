import { SupportPanel } from "@/components/shared/ClientChatUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Users,
  Settings,
  BarChart3,
  Home,
  FileSearch,
  HelpCircle,
} from "lucide-react";
import ClientChat from "./ClientChat";
import { Logo, Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useNavigate } from "react-router-dom";

interface GuestPageProps {
  page: string;
  setPage: (page: string) => void;
}

// Component navigation cho Guest
const GuestNavigation = ({
  setPage,
  page,
}: {
  setPage: (page: string) => void;
  page: string;
}) => {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex h-14 items-center gap-6">
          <Button
            variant={page === "home" ? "secondary" : "ghost"}
            className="text-sm font-medium"
            onClick={() => setPage("home")}
          >
            <Home className="mr-2 h-4 w-4" />
            Trang chủ
          </Button>
          <Button
            variant={page === "chat" ? "secondary" : "ghost"}
            className="text-sm font-medium"
            onClick={() => setPage("chat")}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat Hỗ trợ
          </Button>
          <Button
            variant="ghost"
            className="text-sm font-medium"
            onClick={() => window.open("/lien-he", "_blank")}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Liên hệ
          </Button>
        </nav>
      </div>
    </div>
  );
};

// Component nội dung trang chủ
const HomePage = ({ setPage }: { setPage: (page: string) => void }) => {
  return (
    <div className="flex h-full flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl font-bold tracking-tight">
              Hỗ trợ dịch vụ công <span className="text-primary">24/7</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Chatbot thông minh giúp bạn tra cứu thông tin, giải đáp thắc mắc
              về các thủ tục hành chính một cách nhanh chóng và chính xác.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() => setPage("chat")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Bắt đầu Chat
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
                onClick={() => window.open("/lien-he", "_blank")}
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                Hướng dẫn
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Chat Thông minh</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Trả lời tự động các câu hỏi về thủ tục hành chính với độ chính
                  xác cao
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <FileSearch className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Tra cứu nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Tìm kiếm thông tin về các loại giấy tờ, thủ tục một cách dễ
                  dàng
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Hỗ trợ 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Dịch vụ hỗ trợ liên tục, sẵn sàng giải đáp mọi thắc mắc của
                  bạn
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-primary mb-2" />
                <CardTitle>Thống kê chính xác</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Theo dõi và thống kê các yêu cầu hỗ trợ một cách chi tiết
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Các dịch vụ phổ biến
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={() => setPage("chat")}
                >
                  <FileSearch className="h-6 w-6" />
                  <span>Tra cứu hồ sơ</span>
                  <Badge variant="secondary">Phổ biến</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={() => setPage("chat")}
                >
                  <Settings className="h-6 w-6" />
                  <span>Thủ tục hành chính</span>
                  <Badge variant="secondary">Mới</Badge>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col space-y-2"
                  onClick={() => window.open("/lien-he", "_blank")}
                >
                  <HelpCircle className="h-6 w-6" />
                  <span>Hướng dẫn sử dụng</span>
                  <Badge variant="outline">Hỗ trợ</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const GuestPage = ({ page, setPage }: GuestPageProps) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-background flex-col">
      {/* Navbar */}
      <Navbar01
        signInText="Đăng nhập"
        logo={<Logo />}
        ctaText="Bắt đầu Chat"
        onSignInClick={handleLoginClick}
        onCtaClick={() => setPage("chat")}
      />

      {/* Navigation */}
      <GuestNavigation setPage={setPage} page={page} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {page === "chat" && <ClientChat />}
          {page === "home" && <HomePage setPage={setPage} />}
        </div>

        {/* Support panel - moved to bottom on mobile, side on desktop */}
        <div className="w-80 border-l hidden lg:block">
          <SupportPanel />
        </div>
      </div>

      {/* Mobile support panel */}
      <div className="lg:hidden border-t">
        <div className="h-40 overflow-auto">
          <SupportPanel />
        </div>
      </div>
    </div>
  );
};
export default GuestPage;
