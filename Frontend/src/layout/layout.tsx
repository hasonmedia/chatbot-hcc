import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/Sidebar";
import Navigate from "@/components/shared/Navigate";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-2 sm:p-4 overflow-auto">
          <div className="sticky top-0 z-40 flex items-center gap-2 bg-background/95 backdrop-blur p-2 border-b mb-2 lg:hidden">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-semibold text-lg">Chatbot HCC</h1>
          </div>
          <Navigate />
          <div className="bg-gray-100 p-2 sm:p-4 rounded-lg shadow-inner">
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
