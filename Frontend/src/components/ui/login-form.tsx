import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { loginUser, loading, error, user } = useAuth(); // ✅ lấy đúng tên từ context
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(username, password);
      toast.success(`Xin chào, ${user?.full_name || username}!`);
      navigate("/trang-chu"); // ✅ chuyển về trang chính
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Đăng nhập thất bại");
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Bạn quên mật khẩu?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        {/* Hiển thị lỗi từ context nếu có */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Field>

        <FieldSeparator>Hoặc tiếp tục với</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="w-5 h-5 mr-2"
            >
              <path d="m21.73 18.27-1.09-1.09a4 4 0 0 0-4.88-4.88l-1.09-1.09a2 2 0 1 0-2.83 2.83l1.09 1.09a4 4 0 0 0 4.88 4.88l1.09 1.09a2 2 0 1 0 2.83-2.83Z" />
              <circle cx="9" cy="15" r="4" />
            </svg>
            Đăng nhập với SSO
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
