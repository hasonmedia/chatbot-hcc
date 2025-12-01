import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { KnowledgeBaseItem as TKnowledgeBaseItem } from "@/types/knowledge";
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/formatDateTime";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface KnowledgeBaseItemProps {
  item: TKnowledgeBaseItem;
}

const formSchema = z.object({
  raw_content: z.string().min(1, "Nội dung là bắt buộc."),
  file_name: z.string().optional(),
});

export function KnowledgeBaseItem({ item }: KnowledgeBaseItemProps) {
  const { deleteItem, isDeleting, updateItem, isUpdating } = useKnowledgeBase();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      raw_content: item.raw_content || "",
      file_name: item.file_name || "",
    },
  });

  useEffect(() => {
    if (item.raw_content) {
      form.reset({
        raw_content: item.raw_content,
        file_name: item.file_name || "",
      });
    }
  }, [item.raw_content, item.file_name, form.reset]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteItem(item.detail_id);
    setIsDeleteDialogOpen(false);
  };

  const handleEditClick = () => {
    form.reset({
      raw_content: item.raw_content || "",
      file_name: item.file_name || "",
    });
    setIsEditDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateItem({
        id: item.detail_id,
        data: {
          raw_content: values.raw_content,
          file_name: values.file_name || item.file_name || "",
        },
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  }

  return (
    <>
      <Item variant="outline" className="p-3 sm:p-4">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground shrink-0" />
        <ItemContent className="ml-3 sm:ml-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <ItemTitle className="truncate text-sm sm:text-base">
              {item.file_name}
            </ItemTitle>
            <div className="flex gap-2">
              <Badge
                variant={item.file_type !== null ? "secondary" : "outline"}
                className="text-xs w-fit"
              >
                {item.file_type !== null ? item.file_type : "Văn bản"}
              </Badge>
              {item.category_name && (
                <Badge variant="default" className="text-xs w-fit">
                  {item.category_name}
                </Badge>
              )}
            </div>
          </div>
          <ItemDescription className="text-xs sm:text-sm">
            Tạo lúc: {formatDateTime(item.detail_created_at)}
            {item.username && <span className="ml-2">• {item.username}</span>}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {item.file_type === null && (
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md lg:max-w-lg max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa nội dung</DialogTitle>
                <DialogDescription>
                  Thay đổi nội dung văn bản và nhấn lưu.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="file_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên file</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên file..."
                          {...field}
                          disabled={isUpdating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="raw_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập nội dung văn bản..."
                          className="min-h-[150px] sm:min-h-[200px] resize-none"
                          {...field}
                          disabled={isUpdating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUpdating}
                    className="w-full sm:w-auto"
                  >
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-sm">
              Bạn có chắc chắn muốn xóa "{item.file_name}"? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
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

export const KnowledgeBaseItemSkeleton = () => {
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
