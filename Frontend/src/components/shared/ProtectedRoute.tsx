import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Array<"root" | "superadmin" | "admin" | "user">;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Đang loading, hiển thị loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Cần đăng nhập nhưng chưa đăng nhập
  if (requireAuth && !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng không có quyền truy cập
  if (
    requireAuth &&
    user &&
    requiredRoles.length > 0 &&
    !requiredRoles.includes(user.role)
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn không có quyền truy cập vào trang này. Role hiện tại:{" "}
            <span className="font-semibold">{user.role}</span>
          </p>
          <p className="text-gray-600">
            Yêu cầu role:{" "}
            <span className="font-semibold">{requiredRoles.join(", ")}</span>
          </p>
        </div>
      </div>
    );
  }

  // Có quyền truy cập
  return <>{children}</>;
};

// Hook để kiểm tra quyền truy cập
export const usePermission = () => {
  const { user } = useAuth();

  const hasRole = (roles: Array<"root" | "superadmin" | "admin" | "user">) => {
    return user ? roles.includes(user.role) : false;
  };

  const canAccess = (
    requiredRoles: Array<"root" | "superadmin" | "admin" | "user">
  ) => {
    return user ? requiredRoles.includes(user.role) : false;
  };

  return {
    user,
    hasRole,
    canAccess,
    isRoot: user?.role === "root",
    isSuperAdmin: user?.role === "superadmin",
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
  };
};
