import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Search } from "lucide-react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import {
  KnowledgeBaseItem,
  KnowledgeBaseItemSkeleton,
} from "@/components/shared/KnowledgeBaseItem";
import { KnowledgeBaseForm } from "@/components/shared/KnowledgeBaseForm";

export const DataChatbot = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoadingData } = useKnowledgeBase();
  const items = data?.details;
  const filteredData = Array.isArray(items)
    ? items.filter((item) =>
        item.source_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="container mx-auto max-w-4xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
        Dữ liệu Chatbot
      </h1>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm dữ liệu..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm dữ liệu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm dữ liệu mới</DialogTitle>
            </DialogHeader>
            <KnowledgeBaseForm onFinished={() => setOpenAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex w-full flex-col gap-3 sm:gap-4">
        {isLoadingData && (
          <>
            <KnowledgeBaseItemSkeleton />
            <KnowledgeBaseItemSkeleton />
            <KnowledgeBaseItemSkeleton />
          </>
        )}

        {!isLoadingData &&
          filteredData &&
          filteredData.length > 0 &&
          filteredData.map((item) => (
            <KnowledgeBaseItem key={item.id} item={item} />
          ))}

        {!isLoadingData && (!filteredData || filteredData.length === 0) && (
          <div className="flex h-32 sm:h-40 flex-col items-center justify-center rounded-md border border-dashed">
            <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
              Không tìm thấy dữ liệu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
