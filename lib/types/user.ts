export type UserRole = "admin" | "admin-eval" | "warehouse-operator";

export type UserStatus = "active" | "inactive";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  warehouseLocation: string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};
