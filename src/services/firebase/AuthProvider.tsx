import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";

import {
  signInWithEmail,
  signInWithGithub,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from "./auth";
import { AuthContext, type AuthContextValue } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn: async () => {
        await signInWithGoogle();
      },
      signInWithEmail: async (email: string, password: string) => {
        await signInWithEmail(email, password);
      },
      signUpWithEmail: async (email: string, password: string, displayName?: string) => {
        await signUpWithEmail(email, password, displayName);
      },
      signInWithGithub: async () => {
        await signInWithGithub();
      },
      signOut: async () => {
        await signOutUser();
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
