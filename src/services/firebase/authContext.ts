import { createContext } from "react";
import type { User } from "firebase/auth";

export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
