import { getAllUsers } from "@/services/userService";
import type { UserResponse } from "@/types/user";
import { useCallback, useEffect, useState } from "react";
export const useUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  return { users, loading, error, refetchUsers: fetchUsers };
};
