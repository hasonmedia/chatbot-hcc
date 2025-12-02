import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { FacebookPage } from "@/types/facebook";
import { Facebook, Pencil, Trash2, Loader2 } from "lucide-react";
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
import { useFacebookPages } from "@/hooks/useFacebookPages";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/formatDateTime";
import { useState } from "react";

interface FacebookPageItemProps {
  item: FacebookPage;
  onEdit: (item: FacebookPage) => void;
}

export function FacebookPageItem({ item, onEdit }: FacebookPageItemProps) {
  const { deletePage, isDeletingPage, toggleStatus, isTogglingStatus } =
    useFacebookPages();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deletePage(item.id);
    setIsDeleteDialogOpen(false);
  };

  const handleToggleStatus = async () => {
    await toggleStatus(item.id);
  };

  return (
    <>
      <Item variant="outline" className="p-3 sm:p-4">
        <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
        <ItemContent className="ml-3 sm:ml-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <ItemTitle className="truncate text-sm sm:text-base">
              <span className="font-semibold">Tên Page:</span> {item.page_name}
            </ItemTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant="default"
                className={`text-xs w-fit ${
                  item.is_active
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {item.is_active ? "Đang hoạt động" : "Tắt"}
              </Badge>
            </div>
          </div>
          <ItemDescription className="text-xs sm:text-sm space-y-1">
            <div className="flex flex-col gap-2">
              <div>
                <span className="font-semibold text-foreground">Page ID:</span>
                <span className="break-all">{item.page_id}</span>
              </div>
              {item.url && (
                <div className="flex gap-1">
                  <span className="font-semibold text-foreground">URL:</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {item.url}
                  </a>
                </div>
              )}
            </div>

            {item.description && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Mô tả:</span>{" "}
                {item.description}
              </p>
            )}
            {item.category && (
              <p>
                <span className="font-semibold text-foreground">Danh mục:</span>{" "}
                {item.category}
              </p>
            )}
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">Tạo lúc:</span>{" "}
              {formatDateTime(item.created_at)}
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
                <p>{item.is_active ? "Tắt Page" : "Bật Page"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Edit Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  disabled={isDeletingPage || isTogglingStatus}
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
                  disabled={isDeletingPage || isTogglingStatus}
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600"
                >
                  {isDeletingPage ? (
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
              Bạn có chắc chắn muốn xóa Facebook Page "{item.page_name}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isDeletingPage}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingPage}
              className="w-full sm:w-auto"
            >
              {isDeletingPage ? (
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

export const FacebookPageItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-3 sm:space-x-4 rounded-md border p-3 sm:p-4">
      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-3 sm:h-4 w-3/5" />
        <Skeleton className="h-3 sm:h-4 w-4/5" />
        <Skeleton className="h-3 sm:h-4 w-2/5" />
      </div>
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded shrink-0" />
    </div>
  );
};
