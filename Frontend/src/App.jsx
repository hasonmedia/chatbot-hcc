import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/User/Login";
import DashBoard from './pages/DashBoard/DashBoard';
import Messager_home from './pages/Messenger/Messenger_home';
import Messager_admin from './pages/Messenger/ChatPage';
import UserPage from './pages/User/UserPage';
import KnowledgePage from './pages/Knowledge/Knowledge';
import FacebookPage from './pages/ConnectPlaform/FacebookPage'
import { RoleBasedRedirect } from './components/context/RoleBasedRedirect'
import LLM from './pages/LLM/LLM';
import AdminLayout from './components/layout/MainLayout';
import UserLayout from './components/layout/ViewerLayout';
import Profile from './pages/User/Profile';
import Unauthorized from './pages/Error/Unauthorized.jsx';
import Chart from './pages/DashBoard/Chart.jsx';
import Guide from './pages/Guide/Guide.jsx';

// Viewer components
import ViewerDashboard from './pages/viewer/ViewerDashboard.jsx';
import ChatPage from "./pages/Messenger/ChatPage";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/" element={<RoleBasedRedirect />} />
                <Route path="/chat" element={<Messager_home />} />

                <Route element={<AdminLayout />}>
                    <Route path="/dashboard" element={<DashBoard />} />
                    <Route path="/dashboard/cau-hinh-he-thong" element={<LLM />} />
                    <Route path="/admin/admin-analytics" element={<Chart />} />
                    <Route path="/admin/chat" element={<Messager_admin />} />
                    <Route path="/admin/users" element={<UserPage />} />
                    <Route path="/dashboard/cau-hinh-kien-thuc" element={<KnowledgePage />} />
                    <Route path="/admin/facebook_page" element={<FacebookPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/dashboard-guide" element={<Guide />} />
                </Route>
                <Route element={<UserLayout />}>
                    <Route path="/viewer" element={<ViewerDashboard />} />
                    <Route path="/viewer/chat" element={<ChatPage />} />
                    <Route path="/viewer/profile" element={<Profile />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;