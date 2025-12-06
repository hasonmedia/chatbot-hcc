import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { KnowledgeCategory, CategoryFormData } from "@/types/knowledge";

interface CategoryFormProps {
    category?: KnowledgeCategory | null;
    onSubmit: (data: CategoryFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const CategoryForm = ({
    category,
    onSubmit,
    onCancel,
    isLoading = false,
}: CategoryFormProps) => {
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || "",
            });
        }
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">
                    Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên danh mục"
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">
                    Mô tả <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Nhập mô tả"
                    rows={4}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={isLoading || !formData.name.trim() || !formData.description.trim()}>
                    {isLoading ? "Đang xử lý..." : category ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    );
};
