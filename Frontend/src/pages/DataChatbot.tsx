import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Filter, X, Trash2, Loader2, Check } from "lucide-react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import {
    KnowledgeBaseItem,
    KnowledgeBaseItemSkeleton,
} from "@/components/shared/KnowledgeBaseItem";
import { KnowledgeBaseForm } from "@/components/shared/KnowledgeBaseForm";
import { cn } from "@/lib/utils";

export const DataChatbot = () => {
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [openFileTypeFilter, setOpenFileTypeFilter] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    
    const { data, isLoadingData, categories, isLoadingCategories, deleteMultiple, isDeletingMultiple } = useKnowledgeBase(
        selectedCategories.length > 0 ? selectedCategories : undefined,
        selectedFileTypes.length > 0 ? selectedFileTypes : undefined
    );

    // Flatten all details from all knowledge bases
    const allDetails = data?.flatMap(kb => 
        kb.details.map(detail => ({
            ...detail,
            kb_title: kb.title,
            kb_id: kb.id
        }))
    ) || [];

    const filteredData = searchTerm
        ? allDetails.filter((item) =>
            item.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.source_type?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : allDetails;

    const handleCategoryToggle = (categoryId: number) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleClearCategories = () => {
        setSelectedCategories([]);
    };

    const handleFileTypeToggle = (fileType: string) => {
        setSelectedFileTypes(prev =>
            prev.includes(fileType)
                ? prev.filter(type => type !== fileType)
                : [...prev, fileType]
        );
    };

    const handleClearFileTypes = () => {
        setSelectedFileTypes([]);
    };

    const handleSelectItem = (detailId: number) => {
        setSelectedItems(prev =>
            prev.includes(detailId)
                ? prev.filter(id => id !== detailId)
                : [...prev, detailId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === filteredData.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredData.map(item => item.detail_id));
        }
    };

    const handleToggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        if (isDeleteMode) {
            setSelectedItems([]);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedItems.length > 0) {
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDeleteMultiple = async () => {
        try {
            await deleteMultiple(selectedItems);
            setSelectedItems([]);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting multiple items:", error);
        }
    };

    const selectedCategoryNames = categories?.filter(cat => 
        selectedCategories.includes(cat.id)
    ).map(cat => cat.name) || [];

    const fileTypeOptions = [
        { value: 'PDF', label: 'PDF' },
        { value: 'DOCX', label: 'DOCX' },
        { value: 'XLSX', label: 'XLSX' },
        { value: 'TEXT', label: 'TEXT' },
    ];

    return (
        <div className="container mx-auto max-w-4xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
                Dữ liệu Chatbot
            </h1>

            <div className="mb-4 sm:mb-6 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm dữ liệu..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        {!isDeleteMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleToggleDeleteMode}
                                    size="sm"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleSelectAll}
                                    size="sm"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    {selectedItems.length === filteredData.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleToggleDeleteMode}
                                    size="sm"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Hủy
                                </Button>
                                {selectedItems.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteSelected}
                                        size="sm"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa ({selectedItems.length})
                                    </Button>
                                )}
                            </>
                        )}
                        <Popover open={openFilter} onOpenChange={setOpenFilter}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="relative">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Lọc danh mục
                                    {selectedCategories.length > 0 && (
                                        <Badge 
                                            className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                                            variant="destructive"
                                        >
                                            {selectedCategories.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="end">
                                <div className="p-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">Lọc theo danh mục</h4>
                                        {selectedCategories.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-1 text-xs"
                                                onClick={handleClearCategories}
                                            >
                                                Xóa tất cả
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {isLoadingCategories ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Đang tải...
                                        </div>
                                    ) : categories && categories.length > 0 ? (
                                        categories.map((category) => (
                                            <label
                                                key={category.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                                                    selectedCategories.includes(category.id) && "bg-accent"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category.id)}
                                                    onChange={() => handleCategoryToggle(category.id)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <span className="text-sm flex-1">{category.name}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Không có danh mục
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover open={openFileTypeFilter} onOpenChange={setOpenFileTypeFilter}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="relative">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Lọc loại file
                                    {selectedFileTypes.length > 0 && (
                                        <Badge 
                                            className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                                            variant="destructive"
                                        >
                                            {selectedFileTypes.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="end">
                                <div className="p-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">Lọc theo loại file</h4>
                                        {selectedFileTypes.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-1 text-xs"
                                                onClick={handleClearFileTypes}
                                            >
                                                Xóa tất cả
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-2">
                                    {fileTypeOptions.map((fileType) => (
                                        <label
                                            key={fileType.value}
                                            className={cn(
                                                "flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                                                selectedFileTypes.includes(fileType.value) && "bg-accent"
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedFileTypes.includes(fileType.value)}
                                                onChange={() => handleFileTypeToggle(fileType.value)}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm flex-1">{fileType.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm dữ liệu
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Thêm dữ liệu mới</DialogTitle>
                                </DialogHeader>
                                <KnowledgeBaseForm onFinished={() => setOpenAddDialog(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Selected Categories Display */}
                {selectedCategoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Danh mục:</span>
                        {selectedCategoryNames.map((name, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                                {name}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                    onClick={() => {
                                        const categoryId = categories?.find(c => c.name === name)?.id;
                                        if (categoryId) handleCategoryToggle(categoryId);
                                    }}
                                />
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Selected File Types Display */}
                {selectedFileTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Loại file:</span>
                        {selectedFileTypes.map((type) => (
                            <Badge key={type} variant="secondary" className="gap-1">
                                {type}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                    onClick={() => handleFileTypeToggle(type)}
                                />
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog xác nhận xóa nhiều */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            Bạn có chắc chắn muốn xóa {selectedItems.length} file đã chọn?
                        </p>
                        <p className="text-sm text-red-600 mt-2 font-semibold">
                            Cảnh báo: Hành động này không thể hoàn tác!
                        </p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeletingMultiple}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmDeleteMultiple}
                            disabled={isDeletingMultiple}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeletingMultiple ? (
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

            <div className="flex w-full flex-col gap-3 sm:gap-4">
                {isLoadingData && (
                    <>
                        <KnowledgeBaseItemSkeleton />
                        <KnowledgeBaseItemSkeleton />
                        <KnowledgeBaseItemSkeleton />
                    </>
                )}

                {!isLoadingData &&
                    filteredData &&
                    filteredData.length > 0 &&
                    filteredData.map((item) => (
                        <div key={item.detail_id} className="flex items-center gap-2">
                            <div className="flex-1">
                                <KnowledgeBaseItem 
                                    item={item}
                                />
                            </div>
                            {isDeleteMode && (
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.detail_id)}
                                    onChange={() => handleSelectItem(item.detail_id)}
                                    className="h-4 w-4 rounded border-gray-300 cursor-pointer shrink-0"
                                />
                            )}
                        </div>
                    ))}

                {!isLoadingData && (!filteredData || filteredData.length === 0) && (
                    <div className="flex h-32 sm:h-40 flex-col items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
                            {selectedCategories.length > 0 || selectedFileTypes.length > 0
                                ? "Không tìm thấy dữ liệu với bộ lọc đã chọn."
                                : "Không tìm thấy dữ liệu."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
