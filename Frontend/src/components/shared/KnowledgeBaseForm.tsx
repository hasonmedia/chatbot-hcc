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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { Loader2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Định nghĩa schema validation
const formSchema = z.object({
  title: z.string().optional(),
  category_id: z.string().min(1, "Vui lòng chọn danh mục."),
  description: z.string().optional(),
  raw_content: z.string().optional(),
  files: z.custom<FileList>().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface KnowledgeBaseFormProps {
  onFinished: () => void;
}

interface FileWithDescription {
  file: File;
  description: string;
}

export function KnowledgeBaseForm({ onFinished }: KnowledgeBaseFormProps) {
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [selectedFiles, setSelectedFiles] = useState<FileWithDescription[]>([]);
  const [fileDescriptionErrors, setFileDescriptionErrors] = useState<{ [key: number]: string }>({});
  const {
    createRichText,
    isCreatingRichText,
    createFiles,
    isCreatingFiles,
    categories,
    isLoadingCategories,
  } = useKnowledgeBase();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category_id: "",
      description: "",
      raw_content: "",
      files: undefined,
    },
  });

  const isLoading = isCreatingRichText || isCreatingFiles;

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        file,
        description: ""
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    // Xóa lỗi của file bị xóa và cập nhật lại index
    setFileDescriptionErrors(prev => {
      const newErrors: { [key: number]: string } = {};
      Object.keys(prev).forEach(key => {
        const idx = parseInt(key);
        if (idx < index) {
          newErrors[idx] = prev[idx];
        } else if (idx > index) {
          newErrors[idx - 1] = prev[idx];
        }
      });
      return newErrors;
    });
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, description } : item
      )
    );
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (description.trim()) {
      setFileDescriptionErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (ext === "doc" || ext === "docx") return "📝";
    if (ext === "xls" || ext === "xlsx") return "📊";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const onSubmit = async (values: FormValues) => {
    const user_id = user?.id;

    try {
      if (activeTab === "text") {
        // Validate title khi nhập văn bản
        if (!values.title || values.title.trim().length < 3) {
          form.setError("title", {
            message: "Tiêu đề phải có ít nhất 3 ký tự.",
          });
          return;
        }

        if (!values.description || !values.description.trim()) {
          form.setError("description", {
            message: "Mô tả không được để trống.",
          });
          return;
        }

        if (!values.raw_content) {
          form.setError("raw_content", {
            message: "Nội dung không được rỗng.",
          });
          return;
        }
        await createRichText({
          kb_id: 1,
          data: {
            file_name: values.title || "",
            raw_content: values.raw_content,
            description: values.description,
            user_id: user_id ?? 0,
            category_id: parseInt(values.category_id),
          },
        });
      }

      if (activeTab === "file") {
        console.log("Validating files...", selectedFiles);
        
        if (selectedFiles.length === 0) {
          form.setError("files", { message: "Vui lòng chọn ít nhất 1 file." });
          return;
        }

        // Kiểm tra xem tất cả các file đã có mô tả chưa
        const errors: { [key: number]: string } = {};
        selectedFiles.forEach((fileItem, index) => {
          if (!fileItem.description.trim()) {
            errors[index] = "Vui lòng nhập mô tả cho file này";
          }
        });

        console.log("Description errors:", errors);

        if (Object.keys(errors).length > 0) {
          setFileDescriptionErrors(errors);
          form.setError("files", { 
            message: `Vui lòng nhập mô tả cho ${Object.keys(errors).length} file chưa có mô tả.` 
          });
          // Scroll to top để người dùng thấy thông báo lỗi
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Xóa tất cả lỗi khi validation pass
        setFileDescriptionErrors({});

        // Tìm tên danh mục từ category_id
        const selectedCategory = categories?.find(cat => cat.id === parseInt(values.category_id));
        const categoryName = selectedCategory?.name || "";

        // Gửi từng file với mô tả riêng
        for (const fileItem of selectedFiles) {
          const formData = new FormData();
          formData.append("category_id", values.category_id);
          formData.append("category_name", categoryName);
          formData.append("description", fileItem.description);
          formData.append("user_id", String(user_id));
          formData.append("files", fileItem.file);

          await createFiles(formData);
        }
      }

      onFinished(); // Đóng dialog
      form.reset(); // Reset form
      setSelectedFiles([]); // Clear selected files
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
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>
                        Đang tải...
                      </SelectItem>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        Không có danh mục
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {activeTab === "text" && (
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả cho dữ liệu..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <TabsContent value="text">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tiêu đề cho dữ liệu..."
                      {...field}
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
                <FormItem className="mt-4">
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
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        handleFileChange(e.target.files);
                        // Reset input để có thể chọn lại cùng file
                        e.target.value = '';
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {Object.keys(fileDescriptionErrors).length > 0 && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Vui lòng nhập mô tả cho {Object.keys(fileDescriptionErrors).length} file bên dưới
                    </p>
                  </div>
                )}
                <p className="text-sm font-medium">
                  Đã chọn {selectedFiles.length} file:
                </p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedFiles.map((fileItem, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-md border bg-muted/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl">
                            {getFileIcon(fileItem.file.name)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(fileItem.file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Mô tả *
                        </label>
                        <Textarea
                          placeholder="Nhập mô tả cho file này..."
                          className={`mt-1 min-h-16 text-sm ${
                            fileDescriptionErrors[index] ? "border-red-500 focus-visible:ring-red-500" : ""
                          }`}
                          value={fileItem.description}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        />
                        {fileDescriptionErrors[index] && (
                          <p className="text-xs text-red-500 mt-1">
                            {fileDescriptionErrors[index]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
