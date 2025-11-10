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
import { useZaloBots } from "@/hooks/useZaloBots";
import {
  ZaloBotItem,
  ZaloBotItemSkeleton,
} from "@/components/shared/ZaloBotItem";
import { ZaloBotForm } from "@/components/shared/ZaloBotForm";
import type { ZaloBot } from "@/types/zalo";

export const ZaloPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState<ZaloBot | null>(null);
  const { data, isLoadingBots } = useZaloBots();

  // Filter bots theo search term
  const filteredData = Array.isArray(data)
    ? data.filter((item) =>
        item.bot_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleOpenAddDialog = () => {
    setEditData(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item: ZaloBot) => {
    setEditData(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditData(null);
  };

  return (
    <div className="container mx-auto max-w-4xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
        Quản lý Zalo Bots
      </h1>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên bot..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm Zalo Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editData ? "Chỉnh sửa Zalo Bot" : "Thêm Zalo Bot mới"}
              </DialogTitle>
            </DialogHeader>
            <ZaloBotForm onFinished={handleCloseDialog} editData={editData} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex w-full flex-col gap-3 sm:gap-4">
        {isLoadingBots && (
          <>
            <ZaloBotItemSkeleton />
            <ZaloBotItemSkeleton />
            <ZaloBotItemSkeleton />
          </>
        )}

        {!isLoadingBots &&
          filteredData &&
          filteredData.length > 0 &&
          filteredData.map((item) => (
            <ZaloBotItem
              key={item.id}
              item={item}
              onEdit={handleOpenEditDialog}
            />
          ))}

        {!isLoadingBots && (!filteredData || filteredData.length === 0) && (
          <div className="flex h-32 sm:h-40 flex-col items-center justify-center rounded-md border border-dashed">
            <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
              Không tìm thấy Zalo Bot nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
