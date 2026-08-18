// src/services/authService.ts

import api from "../lib/api";
import {
  ApiResponse,
  CurrentUser,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "../types/auth";

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

// LOGIN
export async function login(payload: LoginPayload): Promise<{
  error: string | null;
  data?: LoginResponseData;
}> {
  try {
    const res = await api.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      payload,
    );

    if (!res.data.success) {
      return {
        error: res.data.message || "Login failed",
      };
    }

    return {
      error: null,
      data: res.data.data,
    };
  } catch (err) {
    return {
      error: extractErrorMessage(
        err,
        "Something went wrong during login",
      ),
    };
  }
}

// REGISTER
export async function register(
  payload: RegisterPayload,
): Promise<string | null> {
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
    return extractErrorMessage(
      err,
      "Something went wrong during registration",
    );
  }
}

// LOGOUT
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Logout should still clear the frontend session
    // even if the API request fails.
  }
}

// GET CURRENT USER
export async function getCurrentUser(): Promise<{
  user: CurrentUser | null;
  error: string | null;
}> {
  try {
    const res = await api.get<ApiResponse<CurrentUser>>(
      "/auth/profile",
    );

    if (!res.data.success) {
      return {
        user: null,
        error: res.data.message || "Failed to get current user",
      };
    }

    return {
      user: res.data.data,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: extractErrorMessage(
        err,
        "Failed to get current user",
      ),
    };
  }
}

// FORGOT PASSWORD
export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<string | null> {
  try {
    const res = await api.post<ApiResponse<null>>(
      "/auth/forgot-password",
      payload,
    );

    if (!res.data.success) {
      return res.data.message || "Failed to send OTP";
    }

    return null;
  } catch (err) {
    return extractErrorMessage(err, "Failed to send OTP");
  }
}

// VERIFY OTP
export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<string | null> {
  try {
    const res = await api.post<ApiResponse<null>>(
      "/auth/verify-otp",
      payload,
    );

    if (!res.data.success) {
      return res.data.message || "Invalid OTP";
    }

    return null;
  } catch (err) {
    return extractErrorMessage(err, "Invalid OTP");
  }
}

// RESET PASSWORD
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<string | null> {
  try {
    const res = await api.post<ApiResponse<null>>(
      "/auth/reset-password",
      payload,
    );

    if (!res.data.success) {
      return res.data.message || "Failed to reset password";
    }

    return null;
  } catch (err) {
    return extractErrorMessage(
      err,
      "Failed to reset password",
    );
  }
}