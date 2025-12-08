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

  useEffect(() => {
    let isMounted = true;

    // Thêm timeout để tránh loading vô hạn
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth loading timeout - forcing loading to false");
        setLoading(false);
      }
    }, 5000); // 10 seconds timeout

    const runFetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const me = await getMe();
        if (isMounted) {
          setUser(me);
        }
      } catch (error: any) {
        if (isMounted) {
          // Chỉ log lỗi nếu không phải 401 (unauthorized)
          if (error.response?.status !== 401) {
            console.error("Fetch user error:", error);
          }
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };

    runFetchUser();

    const handleAuthFailed = () => {
      if (isMounted) {
        setUser(null);
        setLoading(false); // Đảm bảo loading = false khi auth failed
      }
    };

    window.addEventListener("auth-failed", handleAuthFailed);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener("auth-failed", handleAuthFailed);
    };
  }, []);
  const loginUser = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await login(username, password);
      const me = await getMe();
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
