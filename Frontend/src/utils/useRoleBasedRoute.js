import { useAuth } from "../components/context/AuthContext";

export const useRoleBasedRoute = () => {
    const { user } = useAuth();

    const getHomeRoute = () => {
        if (!user) return "/login";

        switch (user.role) {
            case "viewer":
                return "/viewer";
            case "admin":
            case "root":
            case "superadmin":
                return "/dashboard";
            default:
                return "/login";
        }
    };

    return { getHomeRoute, homeRoute: getHomeRoute() };
};