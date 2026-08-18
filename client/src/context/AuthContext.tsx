"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import {
  saveAuthSession,
  getStoredUser,
  getAccessToken,
  clearAuthSession,
} from "../lib/auth";
import {
  ApiResponse,
  CurrentUser,
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
} from "../types/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  // Returns an error message string on failure, or null on success.
  // We return a string instead of throwing so the login page can
  // show the message inline without a try/catch.
  login: (payload: LoginPayload) => Promise<string | null>;
  register: (payload: RegisterPayload) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ───────────────────────────────────────────────────────
  // On first mount: if cookies already hold a token, trust the
  // cached user for an instant UI, but ALSO verify it against
  // GET /auth/profile in the background. This catches cases
  // like: token expired while the tab was closed for days, or
  // isActive was flipped to false by an admin (see JwtStrategy.
  // validate() — it throws if !user.isActive).
  // ───────────────────────────────────────────────────────
  useEffect(() => {
    const token = getAccessToken();
    const cachedUser = getStoredUser();

    if (!token) {
      setLoading(false);
      return;
    }

    if (cachedUser) {
      setUser(cachedUser);
    }

    api
      .get<ApiResponse<CurrentUser>>("/auth/profile")
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        // api.ts's interceptor already tried refreshing the token
        // and redirecting on hard failure — just clear local state here.
        setUser(null);
        clearAuthSession();
      })
      .finally(() => setLoading(false));
  }, []);

  // ───────────────────────────────────────────────────────
  // LOGIN
  // Matches POST /auth/login in auth.controller.ts.
  // Reminder: this endpoint ALWAYS returns HTTP 200, even on
  // wrong password — the backend catches its own errors (see
  // auth.service.ts login()). So we check `success` in the body,
  // not the HTTP status.
  // ───────────────────────────────────────────────────────
  async function login(payload: LoginPayload): Promise<string | null> {
    try {
      const res = await api.post<ApiResponse<LoginResponseData>>(
        "/auth/login",
        payload,
      );

      if (!res.data.success) {
        return res.data.message || "Login failed";
      }

      const { accessToken, refreshToken, user: loggedInUser } = res.data.data;
      saveAuthSession(accessToken, refreshToken, loggedInUser);
      setUser(loggedInUser as CurrentUser);

      return null; // null = success, no error message
    } catch (err) {
      return extractErrorMessage(err, "Something went wrong during login");
    }
  }

  // ───────────────────────────────────────────────────────
  // REGISTER
  // Matches POST /auth/register. Unlike login, this endpoint
  // does NOT catch its own errors — a duplicate email throws a
  // real BadRequestException (real HTTP 400), so this one DOES
  // land in the catch block below.
  // ───────────────────────────────────────────────────────
  async function register(payload: RegisterPayload): Promise<string | null> {
    try {
      const res = await api.post<ApiResponse<RegisterResponseData>>(
        "/auth/register",
        payload,
      );

      if (!res.data.success) {
        return res.data.message || "Registration failed";
      }

      return null;
    } catch (err) {
      return extractErrorMessage(err, "Something went wrong during registration");
    }
  }

  // ───────────────────────────────────────────────────────
  // LOGOUT
  // Matches POST /auth/logout — requires JwtAuthGuard, clears
  // the stored refreshToken hash on the backend (see
  // auth.service.ts logout()). We call it best-effort: even if
  // the network call fails, we still clear local state so the
  // user is never stuck "logged in" on the frontend.
  // ───────────────────────────────────────────────────────
  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — we clear local session regardless
    } finally {
      clearAuthSession();
      setUser(null);
      router.push("/login");
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}

// Small shared helper: axios errors carry the backend's
// { success, message, error } body inside err.response.data
// (see the ApiResponse type) — pull the message out of it,
// falling back to a generic message if the shape is unexpected.
function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as any).response?.data?.message === "string"
  ) {
    return (err as any).response.data.message;
  }
  return fallback;
}