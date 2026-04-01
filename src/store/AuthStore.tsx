import { create } from "zustand";
import { AuthState, User } from "../types/auth";

/**
 * Global Authentication Store (Zustand)
 *
 * IMPORTANT SECURITY NOTE:
 * The accessToken is stored strictly in memory (RAM).
 * This store is NOT persisted to localStorage or sessionStorage
 * to mitigate XSS (Cross-Site Scripting) token theft.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken: string, user: User) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    }),
}));
