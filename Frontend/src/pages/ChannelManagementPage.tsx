import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Facebook, MessageCircle, Send } from "lucide-react";

// Import các page components
import { FacebookPage } from "@/pages/FacebookPage";
import { ZaloPage } from "@/pages/ZaloPage";
import { TelegramPage } from "@/pages/TelegramPage";

export default function ChannelManagementPage() {
  const [activeTab, setActiveTab] = useState("facebook");

  return (
    <div className="container mx-auto max-w-7xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Quản lý Kênh Tích Hợp
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Quản lý các kênh tích hợp Facebook, Zalo và Telegram
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
            <span className="sm:hidden">FB</span>
          </TabsTrigger>
          <TabsTrigger value="zalo" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Zalo</span>
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Telegram</span>
            <span className="sm:hidden">Tele</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facebook" className="mt-0">
          <FacebookPage />
        </TabsContent>

        <TabsContent value="zalo" className="mt-0">
          <ZaloPage />
        </TabsContent>

        <TabsContent value="telegram" className="mt-0">
          <TelegramPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
