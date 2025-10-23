import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();
import axiosClient
  from "../../services/axios";
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axiosClient.get("/users/me", { withCredentials: true });
      setUser(res);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post(
        "/users/login",
        { username, password },
        { withCredentials: true }
      );

      await fetchUser();
      return response.user;
    } catch (error) {
      throw error;
    }
  };
  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await axiosClient.post('/users/logout', {}, { withCredentials: true })
      setUser(null);
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider value={{ user, setUser, login, loading, error, fetchUser, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
