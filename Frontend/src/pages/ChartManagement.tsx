import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Star } from "lucide-react";

// Import các page components
import ChartPage from "@/pages/ChartPage";
import ChartRating from "@/pages/ChartRating";

export default function ChartManagement() {
  const [activeTab, setActiveTab] = useState("messages");

  return (
    <div className="container mx-auto max-w-7xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Quản lý Thống kê
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Xem thống kê tin nhắn và đánh giá của hệ thống
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Thống kê tin nhắn</span>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Thống kê đánh giá</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-0">
          <ChartPage />
        </TabsContent>

        <TabsContent value="ratings" className="mt-0">
          <ChartRating />
        </TabsContent>
      </Tabs>
    </div>
  );
}
