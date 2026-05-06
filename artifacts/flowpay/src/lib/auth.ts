import { create } from "zustand";

interface User {
  id: number;
  name: string | null;
  walletAddress: string;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setToken: (token: string | null) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

function loadFromStorage(): { token: string | null; user: User | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem("fp_token");
    const userRaw = localStorage.getItem("fp_user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

const { token: savedToken, user: savedUser } = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: savedUser,

  setAuth: (token, user) => {
    localStorage.setItem("fp_token", token);
    localStorage.setItem("fp_user", JSON.stringify(user));
    set({ token, user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem("fp_token", token);
    } else {
      localStorage.removeItem("fp_token");
      localStorage.removeItem("fp_user");
    }
    set({ token, user: token ? savedUser : null });
  },

  setUser: (user) => {
    localStorage.setItem("fp_user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("fp_token");
    localStorage.removeItem("fp_user");
    set({ token: null, user: null });
  },
}));
