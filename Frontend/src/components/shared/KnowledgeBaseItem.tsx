import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { KnowledgeBaseItem as TKnowledgeBaseItem } from "@/types/knowledge";
import {
  FileText,
  Loader2,
} from "lucide-react";
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
  description: z.string().min(1, "Mô tả là bắt buộc."),
});

export function KnowledgeBaseItem({ item }: KnowledgeBaseItemProps) {
  const { updateItem, isUpdating } = useKnowledgeBase();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      raw_content: item.raw_content || "",
      file_name: item.file_name || "",
      description: item.description || "",
    },
  });

  useEffect(() => {
    if (item.raw_content) {
      form.reset({
        raw_content: item.raw_content,
        file_name: item.file_name || "",
        description: item.description || "",
      });
    }
  }, [item.raw_content, item.file_name, item.description, form.reset]);

  const handleEditClick = () => {
    form.reset({
      raw_content: item.raw_content || "",
      file_name: item.file_name || "",
      description: item.description || "",
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
          description: values.description,
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
            {item.description && (
              <div className="mb-1 text-muted-foreground">{item.description}</div>
            )}
            Tạo lúc: {formatDateTime(item.detail_created_at)}
            {item.username && <span className="ml-2">• {item.username}</span>}
          </ItemDescription>
        </ItemContent>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả..."
                          className="min-h-20 resize-none"
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
