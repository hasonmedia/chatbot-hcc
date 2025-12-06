import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { CategoryItem } from "@/components/shared/CategoryItem";
import { CategoryForm } from "@/components/shared/CategoryForm";
import { useCategory } from "@/hooks/useCategory";
import type { KnowledgeCategory, CategoryFormData } from "@/types/knowledge";

export default function CategoryPage() {
    const {
        categories,
        isLoading,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategory();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<KnowledgeCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] =
        useState<KnowledgeCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: KnowledgeCategory) => {
        setSelectedCategory(category);
        setIsDialogOpen(true);
    };

    const handleDelete = (category: KnowledgeCategory) => {
        if (category.file_count && category.file_count >= 1) {
            // Có file, hiển thị dialog xác nhận
            setCategoryToDelete(category);
            setIsDeleteDialogOpen(true);
        } else {
            // Không có file, xóa luôn
            handleDirectDelete(category);
        }
    };

    const handleDirectDelete = async (category: KnowledgeCategory) => {
        setIsSubmitting(true);
        try {
            await deleteCategory.mutateAsync(category.id);
        } catch (error) {
            console.error("Error deleting category:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        try {
            if (selectedCategory) {
                await updateCategory.mutateAsync({ category_id: selectedCategory.id, data });
            } else {
                await createCategory.mutateAsync(data);
            }
            setIsDialogOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error("Error submitting category:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsSubmitting(true);
        try {
            await deleteCategory.mutateAsync(categoryToDelete.id);
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
        } catch (error) {
            console.error("Error deleting category:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setSelectedCategory(null);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý Danh mục Kiến thức
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Tạo và quản lý các danh mục để tổ chức kiến thức của bạn
                    </p>
                </div>
                <Button onClick={handleCreate} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Tạo danh mục mới
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">
                        Chưa có danh mục nào
                    </p>
                    <Button onClick={handleCreate} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo danh mục đầu tiên
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <CategoryItem
                            key={category.id}
                            category={category}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Dialog for Create/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCategory
                                ? "Chỉnh sửa danh mục"
                                : "Tạo danh mục mới"}
                        </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        category={selectedCategory}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog for Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            Bạn có chắc chắn muốn xóa danh mục "
                            {categoryToDelete?.name}"?
                        </p>
                        {categoryToDelete?.file_count && categoryToDelete.file_count > 0 && (
                            <p className="text-sm text-red-600 mt-2 font-semibold">
                                Cảnh báo: Danh mục này có {categoryToDelete.file_count} file. 
                                Tất cả các file này sẽ bị xóa và không thể khôi phục!
                            </p>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
