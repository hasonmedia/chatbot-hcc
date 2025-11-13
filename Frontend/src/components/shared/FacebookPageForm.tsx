import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useFacebookPages } from "@/hooks/useFacebookPages";
import type { FacebookPage } from "@/types/facebook";
import { useEffect } from "react";

// Schema validation với zod
const formSchema = z.object({
  page_id: z.string().min(1, "Page ID là bắt buộc"),
  page_name: z.string().min(1, "Tên Page là bắt buộc"),
  access_token: z.string().min(1, "Access Token là bắt buộc"),
  url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  description: z.string().optional(),
  category: z.string().optional(),
  avatar_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  cover_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface FacebookPageFormProps {
  onFinished: () => void;
  editData?: FacebookPage | null;
}

export function FacebookPageForm({
  onFinished,
  editData,
}: FacebookPageFormProps) {
  const { createPage, isCreatingPage, updatePage, isUpdatingPage } =
    useFacebookPages();

  const isLoading = isCreatingPage || isUpdatingPage;
  const isEditMode = !!editData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      page_id: editData?.page_id || "",
      page_name: editData?.page_name || "",
      access_token: editData?.access_token || "",
      url: editData?.url || "",
      description: editData?.description || "",
      category: editData?.category || "",
      avatar_url: editData?.avatar_url || "",
      cover_url: editData?.cover_url || "",
    },
  });

  // Reset form khi editData thay đổi
  useEffect(() => {
    if (editData) {
      form.reset({
        page_id: editData.page_id,
        page_name: editData.page_name,
        access_token: editData.access_token,
        url: editData.url || "",
        description: editData.description || "",
        category: editData.category || "",
        avatar_url: editData.avatar_url || "",
        cover_url: editData.cover_url || "",
      });
    }
  }, [editData, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && editData) {
        // Cập nhật
        await updatePage({
          id: editData.id,
          data: {
            page_id: values.page_id,
            page_name: values.page_name,
            access_token: values.access_token,
            url: values.url || undefined,
            description: values.description || undefined,
            category: values.category || undefined,
            avatar_url: values.avatar_url || undefined,
            cover_url: values.cover_url || undefined,
          },
        });
      } else {
        // Tạo mới
        await createPage({
          page_id: values.page_id,
          page_name: values.page_name,
          access_token: values.access_token,
          url: values.url || undefined,
          description: values.description || undefined,
          category: values.category || undefined,
          avatar_url: values.avatar_url || undefined,
          cover_url: values.cover_url || undefined,
        });
      }

      form.reset();
      onFinished();
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Page ID - Required */}
        <FormField
          control={form.control}
          name="page_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Page ID <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập Facebook Page ID..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                ID của Facebook Page (bắt buộc)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Page Name - Required */}
        <FormField
          control={form.control}
          name="page_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên Page <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên Facebook Page..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Access Token - Required */}
        <FormField
          control={form.control}
          name="access_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Access Token <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập Page Access Token..."
                  className="min-h-[80px] resize-none font-mono text-xs"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Page Access Token từ Facebook (bắt buộc)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL - Optional */}
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://facebook.com/yourpage"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description - Optional */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả về Facebook Page..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category - Optional */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập danh mục..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Avatar URL - Optional */}
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Avatar</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover URL - Optional */}
        <FormField
          control={form.control}
          name="cover_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Ảnh bìa</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/cover.jpg"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading
            ? "Đang xử lý..."
            : isEditMode
            ? "Cập nhật Page"
            : "Thêm Page"}
        </Button>
      </form>
    </Form>
  );
}
