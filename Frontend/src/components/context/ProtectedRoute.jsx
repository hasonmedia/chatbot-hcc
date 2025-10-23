import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";


export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};

