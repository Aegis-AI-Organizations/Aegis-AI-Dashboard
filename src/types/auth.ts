export type UserRole =
  | "superadmin"
  | "admin"
  | "billing_aegis"
  | "technicien"
  | "support"
  | "owner"
  | "billing_client"
  | "operateur"
  | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
  role: UserRole;
  avatar_url?: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setHydrating: (isHydrating: boolean) => void;
}
