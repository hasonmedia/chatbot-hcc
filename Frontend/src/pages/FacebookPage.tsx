import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Search, Edit } from "lucide-react";
import { useFacebookPages } from "@/hooks/useFacebookPages";
import {
    FacebookPageItem,
    FacebookPageItemSkeleton,
} from "@/components/shared/FacebookPageItem";
import { FacebookPageForm } from "@/components/shared/FacebookPageForm";
import LoginWithFb from "@/components/shared/LoginWithFb";
import type { FacebookPage as FacebookPageType } from "@/types/facebook";

export const FacebookPage = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editData, setEditData] = useState<FacebookPageType | null>(null);
    const [showMethodSelection, setShowMethodSelection] = useState(false);
    const { data, isLoadingPages } = useFacebookPages();

    // Filter pages theo search term
    const filteredData = Array.isArray(data)
        ? data.filter(
            (item) =>
                item.page_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.page_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const handleOpenAddDialog = () => {
        setEditData(null);
        setShowMethodSelection(true);
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (item: FacebookPageType) => {
        setEditData(item);
        setShowMethodSelection(false);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditData(null);
        setShowMethodSelection(false);
    };

    const handleManualEntry = () => {
        setShowMethodSelection(false);
    };

    return (
        <div className="container mx-auto max-w-4xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">
                Quản lý Facebook Pages
            </h1>

            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên, ID, danh mục..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto" onClick={handleOpenAddDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm Facebook Page
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editData ? "Chỉnh sửa Facebook Page" : "Thêm Facebook Page mới"}
                            </DialogTitle>
                        </DialogHeader>

                        {!editData && showMethodSelection ? (
                            <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground text-center mb-6">
                                    Chọn phương thức thêm Facebook Page
                                </p>
                                <div className="grid gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-auto py-6 flex flex-col items-center gap-2"
                                        onClick={handleManualEntry}
                                    >
                                        <Edit className="h-6 w-6" />
                                        <span className="font-semibold">Nhập thủ công</span>
                                        <span className="text-xs text-muted-foreground">
                                            Nhập thông tin Page và Access Token thủ công
                                        </span>
                                    </Button>
                                    <LoginWithFb />
                                </div>
                            </div>
                        ) : (
                            <FacebookPageForm
                                onFinished={handleCloseDialog}
                                editData={editData}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex w-full flex-col gap-3 sm:gap-4">
                {isLoadingPages && (
                    <>
                        <FacebookPageItemSkeleton />
                        <FacebookPageItemSkeleton />
                        <FacebookPageItemSkeleton />
                    </>
                )}

                {!isLoadingPages &&
                    filteredData &&
                    filteredData.length > 0 &&
                    filteredData.map((item) => (
                        <FacebookPageItem
                            key={item.id}
                            item={item}
                            onEdit={handleOpenEditDialog}
                        />
                    ))}

                {!isLoadingPages && (!filteredData || filteredData.length === 0) && (
                    <div className="flex h-32 sm:h-40 flex-col items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
                            Không tìm thấy Facebook Page nào.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
