import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import ConfigChatbot from "./pages/ConfigChatbot";
import { DataChatbot } from "./pages/DataChatbot";
import { FacebookPage } from "./pages/FacebookPage";
import { ZaloPage } from "./pages/ZaloPage";
import { TelegramPage } from "./pages/TelegramPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import ClientChat from "./pages/ClientChat";
import ChannelManagementPage from "./pages/ChannelManagementPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import UserGuidePage from "./pages/UserGuidePage";
import GuestPage from "./pages/GuestPage";
import ChartManagement from "./pages/ChartManagement";
import CategoryPage from "./pages/CategoryPage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { useState } from "react";

function App() {
  const [page, setPage] = useState("home");
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Trang công khai - không cần đăng nhập */}
          <Route
            path="/"
            element={<GuestPage page={page} setPage={setPage} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ClientChat />} />
          <Route path="/lien-he" element={<UserGuidePage />} />

          {/* Các trang cần đăng nhập và có phân quyền */}
          <Route
            element={
              <ProtectedRoute requireAuth={true}>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Trang chủ - tất cả role */}
            <Route
              path="/trang-chu"
              element={
                <ProtectedRoute
                  requiredRoles={["root", "superadmin", "admin", "user"]}
                >
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Quản lý người dùng - root, superadmin, admin */}
            <Route
              path="/quan-ly-nguoi-dung"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <UserPage />
                </ProtectedRoute>
              }
            />

            {/* Cấu hình hệ thống - chỉ root, superadmin */}
            <Route
              path="/cau-hinh-he-thong"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin"]}>
                  <ConfigChatbot />
                </ProtectedRoute>
              }
            />

            {/* Dữ liệu chatbot - root, superadmin, admin */}
            <Route
              path="/du-lieu-chatbot"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <DataChatbot />
                </ProtectedRoute>
              }
            />

            {/* Quản lý danh mục - root, superadmin, admin */}
            <Route
              path="/quan-ly-danh-muc"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <CategoryPage />
                </ProtectedRoute>
              }
            />

            {/* Chat interface - tất cả role */}
            <Route
              path="/quan-ly-chat"
              element={
                <ProtectedRoute
                  requiredRoles={["root", "superadmin", "admin", "user"]}
                >
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            {/* Quản lý kênh - root, superadmin, admin */}
            <Route
              path="/quan-ly-kenh"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <ChannelManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Quản lý Facebook Pages - root, superadmin, admin */}
            <Route
              path="/quan-ly-facebook"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <FacebookPage />
                </ProtectedRoute>
              }
            />

            {/* Quản lý Zalo Bots - root, superadmin, admin */}
            <Route
              path="/quan-ly-zalo"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <ZaloPage />
                </ProtectedRoute>
              }
            />

            {/* Quản lý Telegram Bots - root, superadmin, admin */}
            <Route
              path="/quan-ly-telegram"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <TelegramPage />
                </ProtectedRoute>
              }
            />

            {/* Thống kê - root, superadmin, admin */}
            <Route
              path="/thong-ke"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <ChartManagement />
                </ProtectedRoute>
              }
            />

            {/* Thống kê hoạt động - root, superadmin, admin */}
            <Route
              path="/thong-ke-hoat-dong"
              element={
                <ProtectedRoute requiredRoles={["root", "superadmin", "admin"]}>
                  <ActivityLogPage />
                </ProtectedRoute>
              }
            />

            {/* Hướng dẫn sử dụng - tất cả role */}
            <Route
              path="/huong-dan-su-dung"
              element={
                <ProtectedRoute
                  requiredRoles={["root", "superadmin", "admin", "user"]}
                >
                  <UserGuidePage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
