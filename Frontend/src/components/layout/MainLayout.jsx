import Sidebar from "./Sildebar";
function MainLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 bg-gray-50 overflow-auto lg:ml-0">
                <div className="lg:hidden h-16"></div>
                {children}
            </div>
        </div>
    );
}


import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "../context/ProtectedRoute";

const AdminLayout = () => {
    return (
        <ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
            <MainLayout>
                <Outlet />
            </MainLayout>
        </ProtectedRoute>
    );
};
export default AdminLayout;