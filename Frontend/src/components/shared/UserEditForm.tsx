import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, UserResponse } from "@/types/user";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const getFormSchema = (mode: "create" | "edit") => {
  return z
    .object({
      username:
        mode === "create"
          ? z
              .string()
              .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
              .regex(
                /^[a-z0-9_]+$/,
                "Chỉ dùng chữ thường (a-z), số (0-9) và gạch dưới (_)"
              )
          : z.string().optional(), // Tùy chọn khi 'edit' (vì nó disabled và sẽ là undefined)

      full_name: z.string().min(2, "Tên đầy đủ phải có ít nhất 2 ký tự."),
      email: z.string().email("Email không hợp lệ."),
      role: z.enum(["root", "superadmin", "admin", "user"]),
      password: z.string().optional(),
      password_confirmation: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const { password, password_confirmation } = data;

      if (mode === "create") {
        if (!password || password.length < 6) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mật khẩu là bắt buộc và phải có ít nhất 6 ký tự.",
            path: ["password"],
          });
        }
      } else {
        if (password && password.length < 6) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mật khẩu phải có ít nhất 6 ký tự.",
            path: ["password"],
          });
        }
      }

      if (password) {
        if (password !== password_confirmation) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mật khẩu xác nhận không khớp.",
            path: ["password_confirmation"],
          });
        }
      } else if (password_confirmation && mode === "create") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập mật khẩu.",
          path: ["password"],
        });
      }
    });
};

interface UserFormProps {
  mode: "create" | "edit";
  userResponse?: UserResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => Promise<void>;
}

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

// --- Component ---
export function UserForm({
  mode,
  userResponse,
  isOpen,
  onClose,
  onSave,
}: UserFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const isEditMode = mode === "edit";
  const user = userResponse?.user;

  const { user: auth } = useAuth();
  const roles = auth?.abilities.users.avalilable_roles || [];

  const formSchema = React.useMemo(() => getFormSchema(mode), [mode]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      full_name: user?.full_name || "",
      email: user?.email || "",
      role: user?.role || "user",
      password: "",
      password_confirmation: "",
    },
  });

  React.useEffect(() => {
    // --- 3. Cập nhật Reset ---
    form.reset({
      username: user?.username || "",
      full_name: user?.full_name || "",
      email: user?.email || "",
      role: user?.role || "user",
      password: "",
      password_confirmation: "",
    });
    // Khi reset, xóa lỗi của trường username nếu đang ở chế độ edit
    if (isEditMode) {
      form.clearErrors("username");
    }
  }, [user, mode, form, isEditMode]);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const saveData: Partial<User> = {
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        company_id: auth?.company_id,
      };
      if (data.username) {
        saveData.username = data.username;
      }

      // Logic 'password' của bạn đã đúng
      if (data.password) {
        saveData.password = data.password;
      }

      await onSave(saveData);
    } catch (error) {
      toast.error(
        `Lỗi khi lưu: ${(error as Error).message || "Lỗi không xác định"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX ---
  const title = isEditMode ? "Sửa thông tin người dùng" : "Thêm người dùng mới";
  const description = isEditMode
    ? `Cập nhật thông tin cho @${user?.username}. Nhấn "Lưu" để hoàn tất.`
    : "Điền thông tin để tạo người dùng mới.";
  const saveButtonText = isEditMode ? "Lưu thay đổi" : "Tạo người dùng";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* --- 4. Thêm FormField cho Username --- */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="vidu_user"
                      {...field}
                      // Đây là mấu chốt:
                      disabled={isEditMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trường Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đầy đủ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Trường Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Trường Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn một vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() +
                            role.slice(1).replace(/([A-Z])/g, " $1")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trường Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditMode
                          ? "Bỏ trống để giữ nguyên mật khẩu"
                          : "Nhập mật khẩu (ít nhất 6 ký tự)"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trường Password Confirmation */}
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : saveButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
