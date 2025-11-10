import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { TelegramBot } from "@/types/telegram";
import {
  Send,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTelegramBots } from "@/hooks/useTelegramBots";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/formatDateTime";
import { useState } from "react";

interface TelegramBotItemProps {
  item: TelegramBot;
  onEdit: (item: TelegramBot) => void;
}

export function TelegramBotItem({ item, onEdit }: TelegramBotItemProps) {
  const { deleteBot, isDeletingBot, toggleStatus, isTogglingStatus } =
    useTelegramBots();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteBot(item.id);
    setIsDeleteDialogOpen(false);
  };

  const handleToggleStatus = async () => {
    await toggleStatus(item.id);
  };

  return (
    <>
      <Item variant="outline" className="p-3 sm:p-4">
        <Send className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500 shrink-0" />
        <ItemContent className="ml-3 sm:ml-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <ItemTitle className="truncate text-sm sm:text-base">
              <span className="font-semibold">Tên Bot:</span> {item.bot_name}
            </ItemTitle>
            <Badge
                variant="default"
                className={`text-xs w-fit ${
                    item.is_active ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
            >
                {item.is_active ? "Đang hoạt động" : "Tắt"}
            </Badge>
          </div>
          <ItemDescription className="text-xs sm:text-sm space-y-1">
            {item.description && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Mô tả:</span> {item.description}
              </p>
            )}
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Tạo lúc:</span> {formatDateTime(item.created_at)}
            </span>
          </ItemDescription>
        </ItemContent>
        <ItemActions className="shrink-0 flex items-center gap-2">
          <TooltipProvider>
            {/* Toggle Status Switch */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.is_active ? "Tắt Bot" : "Bật Bot"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Edit Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  disabled={isDeletingBot || isTogglingStatus}
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chỉnh sửa</p>
              </TooltipContent>
            </Tooltip>

            {/* Delete Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeletingBot || isTogglingStatus}
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600"
                >
                  {isDeletingBot ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ItemActions>
      </Item>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-sm">
              Bạn có chắc chắn muốn xóa Telegram Bot "{item.bot_name}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isDeletingBot}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingBot}
              className="w-full sm:w-auto"
            >
              {isDeletingBot ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const TelegramBotItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-3 sm:space-x-4 rounded-md border p-3 sm:p-4">
      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-3 sm:h-4 w-3/5" />
        <Skeleton className="h-3 sm:h-4 w-4/5" />
      </div>
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded shrink-0" />
    </div>
  );
};
