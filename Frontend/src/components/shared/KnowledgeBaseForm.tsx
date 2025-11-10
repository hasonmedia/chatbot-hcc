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
import { Loader2, FileText, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "@/components/ui/badge";

// Định nghĩa schema validation
const formSchema = z.object({
    title: z.string().optional(),
    category_id: z.string().min(1, "Vui lòng chọn danh mục."),
    raw_content: z.string().optional(),
    files: z.custom<FileList>().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface KnowledgeBaseFormProps {
    onFinished: () => void;
}

export function KnowledgeBaseForm({ onFinished }: KnowledgeBaseFormProps) {
    const [activeTab, setActiveTab] = useState<"text" | "file">("text");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const { createRichText, isCreatingRichText, createFiles, isCreatingFiles, categories, isLoadingCategories } =
        useKnowledgeBase();
    const { user } = useAuth();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", category_id: "", raw_content: "", files: undefined },
    });

    const isLoading = isCreatingRichText || isCreatingFiles;

    const handleFileChange = (files: FileList | null) => {
        if (files) {
            setSelectedFiles(Array.from(files));
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return '📄';
        if (ext === 'doc' || ext === 'docx') return '📝';
        if (ext === 'xls' || ext === 'xlsx') return '📊';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
                        user_id: user_id ?? 0,
                        category_id: parseInt(values.category_id),
                    },
                });
            }

            if (activeTab === "file") {
                if (selectedFiles.length === 0) {
                    form.setError("files", { message: "Vui lòng chọn ít nhất 1 file." });
                    return;
                }

                const formData = new FormData();
                formData.append("category_id", values.category_id);
                formData.append("user_id", String(user_id));

                selectedFiles.forEach((file) => {
                    formData.append("files", file);
                });

                await createFiles(formData);
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {isLoadingCategories ? (
                                            <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                                        ) : categories && categories.length > 0 ? (
                                            categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="empty" disabled>Không có danh mục</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <TabsContent value="text">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiêu đề *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tiêu đề cho dữ liệu..." {...field} />
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
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* File Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium">Đã chọn {selectedFiles.length} file:</p>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-xl">{getFileIcon(file.name)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file.size)}
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
