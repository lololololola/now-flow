import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  username: string;
  createdAt: string;
};

type AuthState = {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => User | null;
  register: (username: string, password: string) => User | null;
  logout: () => void;
};

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return String(hash);
}

function getPasswordKey(userId: string): string {
  return `now-flow-pwd-${userId}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],

      login: (username, password) => {
        const user = get().users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (!user) return null;

        const storedHash = localStorage.getItem(getPasswordKey(user.id));
        if (storedHash !== hashPassword(password)) return null;

        set({ currentUser: user });
        return user;
      },

      register: (username, password) => {
        const trimmed = username.trim();
        if (!trimmed || !password) return null;

        const exists = get().users.some(
          (u) => u.username.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return null;

        const user: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          username: trimmed,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(getPasswordKey(user.id), hashPassword(password));
        set({ users: [...get().users, user], currentUser: user });
        return user;
      },

      logout: () => set({ currentUser: null }),
    }),
    {
      name: "now-flow-auth",
      version: 1,
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
    }
  )
);
