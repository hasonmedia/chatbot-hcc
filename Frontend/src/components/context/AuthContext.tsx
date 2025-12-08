import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, login, logout } from "@/services/userService";
import type { UserCreateRequest } from "@/types/user";

type AuthContextType = {
  user: UserCreateRequest | null;
  loading: boolean;
  error: string | null;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserCreateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUser = async () => {
    try {
      setLoading(true);
      const me = await getMe();
      setUser(me);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Fetch user error:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();

    // Listen for auth failure events from axios interceptor
    const handleAuthFailed = () => {
      setUser(null);
    };

    window.addEventListener("auth-failed", handleAuthFailed);

    return () => {
      window.removeEventListener("auth-failed", handleAuthFailed);
    };
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
  const logoutUser = async () => {
    try {
      // Gọi API logout để xóa cookies từ server
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user state - HTTP-only cookies sẽ được xóa tự động bởi backend
      setUser(null);
    }
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
