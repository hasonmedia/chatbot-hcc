// src/components/knowledge-base/KnowledgeBaseForm.tsx
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Định nghĩa schema validation
const formSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự."),
  raw_content: z.string().optional(),
  files: z.custom<FileList>().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface KnowledgeBaseFormProps {
  onFinished: () => void;
}

export function KnowledgeBaseForm({ onFinished }: KnowledgeBaseFormProps) {
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const { createRichText, isCreatingRichText, createFiles, isCreatingFiles } =
    useKnowledgeBase();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", raw_content: "", files: undefined },
  });

  const isLoading = isCreatingRichText || isCreatingFiles;

  const onSubmit = async (values: FormValues) => {
    const customer_id = user?.company_id;
    const user_id = user?.id;

    try {
      if (activeTab === "text") {
        if (!values.raw_content) {
          form.setError("raw_content", {
            message: "Nội dung không được rỗng.",
          });
          return;
        }
        await createRichText({
          kb_id: 1,
          data: {
            file_name: values.title,
            raw_content: values.raw_content,
            user_id: user_id ?? 0,
            customer_id: customer_id ?? 0,
          },
        });
      }

      if (activeTab === "file") {
        if (!values.files || values.files.length === 0) {
          form.setError("files", { message: "Vui lòng chọn ít nhất 1 file." });
          return;
        }

        const formData = new FormData();
        formData.append("kb_id", "1");
        formData.append("customer_id", String(customer_id)); // API của bạn nhận string
        formData.append("user_id", String(user_id));

        Array.from(values.files).forEach((file) => {
          formData.append("files", file);
        });

        await createFiles(formData);
      }

      onFinished(); // Đóng dialog
      form.reset(); // Reset form
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <Tabs
      defaultValue="text"
      onValueChange={(value) => setActiveTab(value as "text" | "file")}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="text">Nhập văn bản</TabsTrigger>
        <TabsTrigger value="file">Tải lên File</TabsTrigger>
      </TabsList>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tiêu đề cho dữ liệu..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TabsContent value="text">
            <FormField
              control={form.control}
              name="raw_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung (Rich Text)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung văn bản..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="file">
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Files (PDF, DOCS, Excel)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Đang xử lý..." : "Lưu dữ liệu"}
          </Button>
        </form>
      </Form>
    </Tabs>
  );
}
