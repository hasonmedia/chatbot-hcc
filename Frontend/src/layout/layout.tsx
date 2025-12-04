import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/Sidebar";
import Navigate from "@/components/shared/Navigate";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header - chỉ hiện trên mobile */}
          <div className="sticky top-0 z-40 flex items-center gap-3 bg-background/95 backdrop-blur p-3 border-b lg:hidden">
            <SidebarTrigger className="flex-shrink-0" />
            <h1 className="font-semibold text-base sm:text-lg truncate">
              Chatbot HCC
            </h1>
          </div>

          {/* Navigation - responsive padding */}
          <div className="px-2 sm:px-4 py-2">
            <Navigate />
          </div>

          {/* Main content - responsive padding và overflow */}
          <div className="flex-1 overflow-auto px-2 sm:px-4 pb-4">
            <div className="bg-gray-100 p-2 sm:p-4 lg:p-6 rounded-lg shadow-inner h-full">
              <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-xl h-full overflow-auto">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
