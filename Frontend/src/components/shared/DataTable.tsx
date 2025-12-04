import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsers } from "@/hooks/use-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { UserForm } from "./UserEditForm";
import { updateUser, registerUser, deleteUser } from "@/services/userService";
import type { UserResponse } from "@/types/user";
import ConfirmDialog from "./ConfirmDialog";

export function DataTable() {
  const { users, loading, error, refetchUsers } = useUsers();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    fullName: string;
  } | null>(null);

  const viewableUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((item: UserResponse) => item.permission.can_view);
  }, [users]);

  const handleEditClick = (userResponse: UserResponse) => {
    setCurrentUser(userResponse);
    setIsEditOpen(true);
  };

  const handleCreateClick = () => {
    setIsCreateOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditOpen(false);
    setIsCreateOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = async (data: Partial<User>) => {
    if (!currentUser) return;

    try {
      await updateUser(currentUser.user.id, data);
      toast.success(
        `Đã cập nhật thành công người dùng ${currentUser.user.full_name}`
      );
      handleCloseModals();
      refetchUsers();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || err?.message || "Lỗi không xác định";
      toast.error(`Lỗi khi cập nhật: ${errorMessage}`);
    }
  };

  const handleCreateUser = async (data: Partial<User>) => {
    try {
      await registerUser(data);
      toast.success("Đã tạo người dùng mới thành công");
      handleCloseModals();
      refetchUsers();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || err?.message || "Lỗi không xác định";
      toast.error(`Lỗi khi tạo người dùng: ${errorMessage}`);
    }
  };
  const askDeleteUser = (userId: number, fullName: string) => {
    setSelectedUser({ id: userId, fullName });
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast.success(`Đã xóa thành công ${selectedUser.fullName}`);
      refetchUsers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err.message || "Lỗi không xác định";
      toast.error(`Lỗi: ${msg}`);
    } finally {
      setConfirmOpen(false);
    }
  };
  if (loading) {
    return <div className="text-center p-4">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">Có lỗi xảy ra: {error}</div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateClick} className="w-full sm:w-auto">
          Thêm người dùng
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="px-4">
              Danh sách người dùng trong hệ thống
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Người dùng</TableHead>
                <TableHead className="min-w-[150px]">Tên đầy đủ</TableHead>
                <TableHead className="min-w-[150px] hidden sm:table-cell">
                  Liên hệ
                </TableHead>
                <TableHead className="min-w-[100px]">Vai trò</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">
                  Tình trạng
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewableUsers.length > 0 ? (
                viewableUsers.map((item: UserResponse) => (
                  <TableRow key={item.user.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium text-sm">
                          {item.user.username}
                        </div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {item.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.user.full_name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {item.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {item.user.is_active ? (
                        <Badge variant="success" className="text-xs">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Không hoạt động
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {item.permission.can_edit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                          >
                            Sửa
                          </Button>
                        )}
                        {item.permission.can_delete && (
                          <Button
                            variant="destructive"
                            onClick={() =>
                              askDeleteUser(item.user.id, item.user.full_name)
                            }
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Không tìm thấy người dùng nào.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {isEditOpen && currentUser && (
        <UserForm
          mode="edit"
          userResponse={currentUser}
          isOpen={isEditOpen}
          onClose={handleCloseModals}
          onSave={handleSaveUser}
        />
      )}
      {isCreateOpen && (
        <UserForm
          mode="create"
          isOpen={isCreateOpen}
          onClose={handleCloseModals}
          onSave={handleCreateUser}
        />
      )}
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          title="Xác nhận xóa"
          description={`Bạn có chắc muốn xóa người dùng ${selectedUser?.fullName}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
