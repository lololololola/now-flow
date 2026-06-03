import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  username: string;
  createdAt: string;
};

type AuthState = {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  register: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({
        currentUser: {
          id: session.user.id,
          username: session.user.email?.split("@")[0] ?? "user",
          createdAt: session.user.created_at,
        },
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  login: async (username, password) => {
    const email = `${username}@nowflow.app`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) return null;

    const user: User = {
      id: data.user.id,
      username: username,
      createdAt: data.user.created_at,
    };
    set({ currentUser: user });
    return user;
  },

  register: async (username, password) => {
    const trimmed = username.trim();
    if (!trimmed || !password) return null;

    const email = `${trimmed}@nowflow.app`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error || !data.user) return null;

    const user: User = {
      id: data.user.id,
      username: trimmed,
      createdAt: data.user.created_at,
    };
    set({ currentUser: user });
    return user;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null });
  },
}));
