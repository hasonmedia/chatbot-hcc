import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Đang tải...</div>;

    if (!user) return <Navigate to="/login" />;
    console.log("User role:", user.role);
    // Chuyển hướng dựa trên role
    switch (user.role) {
        case "viewer":
            return <Navigate to="/viewer" />;
        case "admin":
        case "root":
        case "superadmin":
            return <Navigate to="/dashboard" />;
        default:
            return <Navigate to="/login" />;
    }
};