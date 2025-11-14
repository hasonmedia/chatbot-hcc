import { Logo, Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { Sidebar, SupportPanel } from "@/components/shared/ClientChatUI";
import UserGuidePage from "./UserGuidePage";
import { useNavigate } from "react-router-dom";

export const Guide = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full bg-background flex-col">
      {/* Navbar */}
      <Navbar01
        signInText="Đăng nhập"
        logo={<Logo />}
        ctaText="Bắt đầu Chat"
        onSignInClick={() => {
          navigate("/login");
        }}
      />

      {/* Navigation */}
      {/* <GuestNavigation /> */}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r hidden lg:block">
          <Sidebar />
        </div>
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <UserGuidePage />
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
