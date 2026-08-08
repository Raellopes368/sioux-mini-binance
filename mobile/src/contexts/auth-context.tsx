import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/services/api";
import { authService } from "@/services/auth.service";
import {
  getAuthToken,
  removeAuthToken,
  saveAuthToken,
} from "@/services/secure-storage";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import type { User } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = await getAuthToken();

        if (!token) {
          return;
        }

        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        const user = await authService.me();

        setUser(user);
      } catch (error) {
        console.error("Failed to restore session:", error);

        await removeAuthToken();

        delete api.defaults.headers.common.Authorization;

        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    void loadUser();
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);

    try {
      const session = await authService.login(payload);

      await saveAuthToken(session.token);

      api.defaults.headers.common.Authorization = `Bearer ${session.token}`;

      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);

    try {
      const session = await authService.register(payload);

      await saveAuthToken(session.token);

      api.defaults.headers.common.Authorization = `Bearer ${session.token}`;

      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Failed to logout from server:", error);
    } finally {
      await removeAuthToken();

      delete api.defaults.headers.common.Authorization;

      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isInitializing, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
