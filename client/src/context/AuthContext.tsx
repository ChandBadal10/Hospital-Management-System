"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import {
  saveAuthSession,
  getStoredUser,
  getAccessToken,
  clearAuthSession,
} from "../lib/auth";

import {
  CurrentUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "../types/auth";

import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  forgotPassword as forgotPasswordService,
  verifyOtp as verifyOtpService,
  resetPassword as resetPasswordService,
} from "../services/authService";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;

  login: (
    payload: LoginPayload,
  ) => Promise<{
    error: string | null;
    role?: CurrentUser["role"];
  }>;

  register: (
    payload: RegisterPayload,
  ) => Promise<string | null>;

  logout: () => Promise<void>;

  forgotPassword: (
    payload: ForgotPasswordPayload,
  ) => Promise<string | null>;

  verifyOtp: (
    payload: VerifyOtpPayload,
  ) => Promise<string | null>;

  resetPassword: (
    payload: ResetPasswordPayload,
  ) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ─────────────────────────────────────────────
  // INITIALIZE AUTH SESSION
  // ─────────────────────────────────────────────

  useEffect(() => {
    async function initializeAuth() {
      const token = getAccessToken();
      const cachedUser = getStoredUser();

      // No token means user is not authenticated
      if (!token) {
        setLoading(false);
        return;
      }

      // Show cached user immediately
      if (cachedUser) {
        setUser(cachedUser);
      }

      // Verify session with backend
      const result = await getCurrentUser();

      if (result.user) {
        setUser(result.user);
      } else {
        setUser(null);
        clearAuthSession();
      }

      setLoading(false);
    }

    initializeAuth();
  }, []);

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────

  async function login(payload: LoginPayload) {
    const result = await loginService(payload);

    if (result.error || !result.data) {
      return {
        error: result.error || "Login failed",
      };
    }

    const {
      accessToken,
      refreshToken,
      user: loggedInUser,
    } = result.data;

    // Save session
    saveAuthSession(
      accessToken,
      refreshToken,
      loggedInUser,
    );

    // Update context state
    setUser(loggedInUser as CurrentUser);

    return {
      error: null,
      role: loggedInUser.role,
    };
  }

  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────

  async function register(payload: RegisterPayload) {
    return registerService(payload);
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────

  async function logout() {
    await logoutService();

    clearAuthSession();
    setUser(null);

    router.push("/login");
  }

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────

  async function forgotPassword(
    payload: ForgotPasswordPayload,
  ) {
    return forgotPasswordService(payload);
  }

  // ─────────────────────────────────────────────
  // VERIFY OTP
  // ─────────────────────────────────────────────

  async function verifyOtp(
    payload: VerifyOtpPayload,
  ) {
    return verifyOtpService(payload);
  }

  // ─────────────────────────────────────────────
  // RESET PASSWORD
  // ─────────────────────────────────────────────

  async function resetPassword(
    payload: ResetPasswordPayload,
  ) {
    return resetPasswordService(payload);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        verifyOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// USE AUTH HOOK
// ─────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside an <AuthProvider>",
    );
  }

  return ctx;
}