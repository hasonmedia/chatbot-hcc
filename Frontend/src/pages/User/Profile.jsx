import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../../components/user/UserForm';
import { useAuth } from '../../components/context/AuthContext';
import { updateUser } from "../../services/userService";

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(true);

    const handleEditUser = async (id, formData) => {
        const dataToSend = { ...formData, company_id: 1 };
        if (dataToSend.password === "") {
            delete dataToSend.password;
        }
        const updated = await updateUser(id, dataToSend);
        setData(data.map((u) => (u.id === id ? updated.user : u)));
        setShowForm(false);

        // Chuyển hướng về dashboard phù hợp với role
        redirectToDashboard();
    };

    const redirectToDashboard = () => {
        if (user?.role === "viewer") {
            navigate("/viewer");
        } else if (["admin", "root", "superadmin"].includes(user?.role)) {
            navigate("/dashboard");
        } else {
            navigate("/");
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        // Chuyển hướng về dashboard phù hợp với role khi cancel
        redirectToDashboard();
    };
    return (
        <div>
            {showForm && (
                <UserForm
                    initialData={user}
                    onSubmit={(formData) =>
                        handleEditUser(user.id, formData)}
                    onCancel={handleCancel}
                    isProfileMode={true}
                />
            )}
        </div>
    )
}

export default Profile