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
import { updateUser, registerUser } from "@/services/userService";
import { formatDateTime } from "@/lib/formatDateTime";
import type { UserResponse } from "@/types/user";

export function DataTable() {
  const { users, loading, error, refetchUsers } = useUsers();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

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
    } catch (err) {
      toast.error(
        `Lỗi khi cập nhật: ${(err as Error).message || "Lỗi không xác định"}`
      );
    }
  };

  const handleCreateUser = async (data: Partial<User>) => {
    try {
      await registerUser(data);
      toast.success("Đã tạo người dùng mới thành công");
      handleCloseModals();
      refetchUsers();
    } catch (err) {
      toast.error(
        `Lỗi khi tạo người dùng: ${
          (err as Error).message || "Lỗi không xác định"
        }`
      );
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
                  Ngày tạo
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
                      {formatDateTime(item.user.createdAt)}
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
    </>
  );
}
