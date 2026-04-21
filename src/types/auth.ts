export interface User {
  id: string;
  email: string;
  name: string;
  company_id: string;
  role: string;
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
