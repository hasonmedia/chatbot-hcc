import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { KnowledgeCategory } from "@/types/knowledge";

interface CategoryItemProps {
    category: KnowledgeCategory;
    onEdit: (category: KnowledgeCategory) => void;
    onDelete: (category: KnowledgeCategory) => void;
}

export const CategoryItem = ({
    category,
    onEdit,
    onDelete,
}: CategoryItemProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-sm text-gray-600 mb-3">
                            {category.description}
                        </p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>ID: {category.id}</p>
                        <p>Tạo lúc: {formatDate(category.created_at)}</p>
                        <p>Cập nhật: {formatDate(category.updated_at)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(category)}
                        className="hover:bg-blue-50"
                    >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(category)}
                        className="hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
