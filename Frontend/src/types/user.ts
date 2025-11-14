export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  password?: string;
  role: "root" | "superadmin" | "admin" | "user";
  createdAt?: string;
  updatedAt?: string;
  company_id: number;
  is_active: boolean;
}
export interface UserResponse {
  permission: {
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
  user: User;
}
export interface UserCreateRequest {
  access_token: string;
  company_id: number;
  email: string;
  full_name: string;
  id: number;
  role: "root" | "superadmin" | "admin" | "user";
  username: string;
  abilities: {
    users: {
      can_create: boolean;
      avalilable_roles: Array<"root" | "superadmin" | "admin" | "user">;
    };
    companies: {
      can_create: boolean;
    };
  };
}
