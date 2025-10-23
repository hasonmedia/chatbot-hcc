import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/User/Login";
import DashBoard from './pages/DashBoard/DashBoard';
import Messager_home from './pages/Messenger/Messenger_home';
import Messager_admin from './pages/Messenger/ChatPage';
import UserPage from './pages/User/UserPage';
import KnowledgePage from './pages/Knowledge/Knowledge';
import FacebookPage from './pages/ConnectPlaform/FacebookPage'
import { ProtectedRoute } from './components/context/ProtectedRoute'
import { RoleBasedRedirect } from './components/context/RoleBasedRedirect'
import LLM from './pages/LLM/LLM';
import ExportData from './pages/ExportData/ExportData';
import MainLayout from './components/layout/MainLayout';
import ViewerLayout from './components/layout/ViewerLayout';
import Profile from './pages/User/Profile';
import TagManagement from './pages/Tag/Tag';
import SendMessage from './pages/SendMessage/SendMessage.jsx';
import Unauthorized from './pages/Error/Unauthorized.jsx';
import Chart from './pages/DashBoard/Chart.jsx';
import Guide from './pages/Guide/Guide.jsx';

// Viewer components
import ViewerDashboard from './pages/viewer/ViewerDashboard.jsx';
import ViewerTagManagement from './pages/viewer/ViewerTagManagement.jsx';
import ChatPage from "./pages/Messenger/ChatPage";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<RoleBasedRedirect />} />

                {/* Admin Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                        <MainLayout>
                            <DashBoard />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/cau-hinh-he-thong" element={
                    <ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                        <MainLayout>
                            <LLM />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/admin-analytics" element={
                    <ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                        <MainLayout>
                            <Chart />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/send-messages" element={
                    <ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                        <MainLayout>
                            <SendMessage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                <Route path="/chat" element={<Messager_home />} />
                <Route path="/admin/chat" element={<ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                    <Messager_admin />
                </ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["root", "superadmin", "admin"]}>
                    <MainLayout>
                        <UserPage />
                    </MainLayout></ProtectedRoute>} />
                <Route path="/dashboard/cau-hinh-kien-thuc" element={<ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                    <MainLayout>
                        <KnowledgePage />
                    </MainLayout></ProtectedRoute>} />
                <Route path="/admin/facebook_page" element={<ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                    <MainLayout>
                        <FacebookPage />
                    </MainLayout>
                </ProtectedRoute>} />
                <Route path='/dashboard/export' element={<ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                    <MainLayout>
                        <ExportData />
                    </MainLayout></ProtectedRoute>} />
                <Route path='/profile' element={<ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                    <MainLayout>
                        <Profile />
                    </MainLayout></ProtectedRoute>} />
                <Route path='/admin/tag' element={<ProtectedRoute allowedRoles={["admin", "root", "superadmin"]}>
                    <MainLayout>
                        <TagManagement />
                    </MainLayout></ProtectedRoute>} />
                <Route path='/admin/dashboard-guide' element={
                    <MainLayout>
                        <Guide />
                    </MainLayout>} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Viewer Routes */}
                <Route path="/viewer" element={
                    <ProtectedRoute allowedRoles={["viewer"]}>
                        <ViewerLayout>
                            <ViewerDashboard />
                        </ViewerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/viewer/send-messages" element={
                    <ProtectedRoute allowedRoles={["viewer"]}>
                        <ViewerLayout>
                            <SendMessage />
                        </ViewerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/viewer/export-data" element={
                    <ProtectedRoute allowedRoles={["viewer"]}>
                        <ViewerLayout>
                            <ExportData />
                        </ViewerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/viewer/tags" element={
                    <ProtectedRoute allowedRoles={["viewer"]}>
                        <ViewerLayout>
                            <ViewerTagManagement />
                        </ViewerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/viewer/chat" element={
                    <ProtectedRoute allowedRoles={["viewer"]}>
                        <ChatPage />
                    </ProtectedRoute>
                } />
                <Route path="/viewer/profile" element={
                    <ProtectedRoute allowedRoles={["viewer"]}>
                        <ViewerLayout>
                            <Profile />
                        </ViewerLayout>
                    </ProtectedRoute>
                } />

            </Routes>
        </Router>
    );
};

export default App;
