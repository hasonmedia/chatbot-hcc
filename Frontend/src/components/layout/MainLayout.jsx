import Sidebar from "./Sildebar";
export default function MainLayout({ children }) {
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
