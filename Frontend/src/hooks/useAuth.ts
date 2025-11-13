// import { useState, useEffect } from "react";
// import axiosClient from "@/config/axios";

// export function useAuth() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUser = async () => {
//     try {
//       const res = await axiosClient.get("/users/me", { withCredentials: true });
//       setUser(res.data);
//     } catch {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (username: string, password: string) => {
//     try {
//       await axiosClient.post(
//         "/users/login",
//         { username, password },
//         { withCredentials: true }
//       );
//       await fetchUser(); // lúc này cookie đã được trình duyệt lưu
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = async () => {
//     await axiosClient.post("/users/logout", {}, { withCredentials: true });
//     setUser(null);
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   return { user, loading, login, logout };
// }
