import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/resources";
import { clearAuthStorage, getToken, setToken, unwrap, USER_KEY } from "@/services/api";

export interface AuthUser {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTokenState(getToken());
    setUserState(readStoredUser());
    setReady(true);
  }, []);

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    if (typeof window === "undefined") return;
    if (next) window.localStorage.setItem(USER_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const data = await authService.login({ email, password });
      const payload = unwrap<any>(data);
      const nextToken: string | undefined =
        data?.token ?? data?.accessToken ?? payload?.token ?? payload?.accessToken;
      if (!nextToken) throw new Error("Login succeeded but no token was returned by the server.");

      setToken(nextToken);
      setTokenState(nextToken);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("phoneshield_remember", remember ? "1" : "0");
        if (remember) window.localStorage.setItem("phoneshield_email", email);
        else window.localStorage.removeItem("phoneshield_email");
      }

      const nextUser: AuthUser =
        data?.user ?? payload?.user ?? (payload && !Array.isArray(payload) ? payload : { email });
      setUser(nextUser ?? { email });
    },
    [setUser],
  );

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.me();
      if (me) setUser(me as AuthUser);
    } catch {
      /* profile endpoint optional — keep cached user */
    }
  }, [setUser]);

  const logout = useCallback(() => {
    clearAuthStorage();
    setTokenState(null);
    setUserState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
      refreshUser,
    }),
    [user, token, ready, login, logout, setUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
