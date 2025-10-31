import { useState, useEffect, useMemo } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaSearch, FaPlus } from "react-icons/fa";
import UserTable from "../../components/user/UserTable";
import UserForm from "../../components/user/UserForm";
import { UserView } from "../../components/user/UserView";
import { getUsers, postUsers, updateUser } from "../../services/userService";
import { useAuth } from "../../components/context/AuthContext";

const UserPage = () => {
    const { user } = useAuth(); // user object from context, e.g., { ..., abilities: { users: { can_create: true, available_roles: [...] } } }

    // 'data' state now stores the full API response: [{ user: {...}, permission: {...} }, ...]
    const [data, setData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // Stores ONLY the user object for the form
    const [viewingUser, setViewingUser] = useState(null); // Stores ONLY the user object for the view

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const usersWithPermissions = await getUsers();
            setData(usersWithPermissions); // Store the full [{ user, permission }, ...] array
            setLoading(false);
        };
        fetchData();
    }, []);

    // Filter users based on search and backend's 'can_view' permission
    // This function now returns an array of USER objects, not the wrapper object,
    // so UserTable doesn't need to be changed.
    // const getFilteredUsers = () => {
    //     if (!user) return [];

    //     return data
    //         .filter((item) => {
    //             // 1. Filter based on backend permission
    //             if (!item?.permission.can_view) {
    //                 return false;
    //             }
    //             // 2. Filter based on search term
    //             const matchesSearch = item.user.full_name
    //                 .toLowerCase()
    //                 .includes(searchTerm.toLowerCase());

    //             return matchesSearch;
    //         })
    //         .map(item => item.user); // Return only the user object for the table
    // };
    const getFilteredUsers = useMemo(() => {
        if (!data) return [];
        return data.filter((item) => item.permission.can_view);
    }, [data]);

    const handleAddUser = async (formData) => {
        // We assume postUsers returns the new item in the same format: { user: {...}, permission: {...} }
        const newItem = await postUsers({ ...formData, company_id: user.company_id }); // Use current user's company_id
        setData([...data, newItem]); // Add the full new item to state
        setShowForm(false);
    };

    const handleEditUser = async (id, formData) => {
        const dataToSend = { ...formData, company_id: user.company_id };
        if (dataToSend.password === "") {
            delete dataToSend.password;
        }

        const updatedItem = await updateUser(id, dataToSend);

        setData(data.map((item) => (item.user.id === id ? updatedItem : item)));
        setEditingUser(null);
        setShowForm(false);
    };

    const handleEditClick = (targetUser) => {
        setEditingUser(targetUser);
        setShowForm(true);
    };

    // Check if the current user can create new users based on their 'abilities'
    const canCreate = user?.abilities?.users?.can_create || false;

    return (
        <div className="container mx-auto p-2 sm:p-4 lg:p-6 bg-gray-50 min-h-screen max-w-full">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 px-2 sm:px-0">
                    User Management
                </h1>
                {user?.role && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {user.role.toUpperCase()}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 mx-2 sm:mx-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px]">
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm sm:text-base" />
                    </div>

                    {/* Create Button - Use 'abilities' from logged-in user */}
                    {canCreate && (
                        <button
                            onClick={() => {
                                setEditingUser(null);
                                setShowForm(true);
                            }}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center sm:justify-start transition-colors text-sm sm:text-base"
                        >
                            <FaPlus className="mr-2 text-sm sm:text-base" />
                            <span className="sm:inline">Tạo người dùng mới</span>
                        </button>
                    )}
                </div>

                {/* Permission Notice for users who cannot create */}
                {!canCreate && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                            <strong>Chế độ xem:</strong> Bạn chỉ có quyền xem danh sách người dùng, không thể tạo mới hoặc chỉnh sửa.
                        </p>
                    </div>
                )}

                {/* Table Container */}
                <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6">
                    <div className="inline-block min-w-full align-middle px-3 sm:px-4 lg:px-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-32 sm:h-48">
                                <CgSpinner className="animate-spin text-xl sm:text-2xl text-blue-600" />
                            </div>
                        ) : (
                            <UserTable
                                data={getFilteredUsers}
                                onEdit={handleEditClick} // Pass the handler
                                onView={(targetUser) => setViewingUser(targetUser)}
                                permissionsMap={Object.fromEntries(
                                    data.map(item => [item.user.id, item.permission])
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Modals/Overlays */}
                {viewingUser && (
                    <UserView user={viewingUser} onClose={() => setViewingUser(null)} />
                )}
                {showForm && (
                    <UserForm
                        initialData={editingUser}
                        onSubmit={(formData) =>
                            editingUser
                                ? handleEditUser(editingUser.user.id, formData)
                                : handleAddUser(formData)
                        }
                        onCancel={() => {
                            setShowForm(false);
                            setEditingUser(null);
                        }}
                        availableRoles={user?.abilities?.users?.avalilable_roles || []}
                    />
                )}
            </div>
        </div>
    );
};

export default UserPage;