import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, login } from "@/services/userService";
import type { UserCreateRequest } from "@/types/user";

type AuthContextType = {
  user: UserCreateRequest | null;
  loading: boolean;
  error: string | null;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserCreateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUser = async () => {
    try {
      setLoading(true);
      const me = await getMe(); // tự động gửi cookie
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  const loginUser = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await login(username, password);
      const me = await getMe(); // Gọi lại để lấy thông tin user
      setUser(me);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.details || "Đăng nhập thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const logoutUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
