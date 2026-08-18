import Cookies from "js-cookie";
import { CurrentUser } from "../types/auth";

// ─────────────────────────────────────────────────────────
// Cookie keys — kept in one place so we never typo a string
// ─────────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY = "hms_access_token";
const REFRESH_TOKEN_KEY = "hms_refresh_token";
const USER_KEY = "hms_user";

// Access token expires in 15m on the backend (see auth.module.ts
// JwtModule.registerAsync signOptions). We set the cookie to expire
// slightly after that so the browser doesn't hold a stale cookie
// past what the backend will still accept anyway.
const ACCESS_TOKEN_EXPIRES_IN_DAYS = 1 / 96; // ~15 minutes
// Refresh token expires in 7d on the backend.
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

// ─────────────────────────────────────────────────────────
// Save both tokens + the logged-in user after login/refresh
// ─────────────────────────────────────────────────────────
export function saveAuthSession(
  accessToken: string,
  refreshToken: string,
  user?: CurrentUser | LoginUserShape,
) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: ACCESS_TOKEN_EXPIRES_IN_DAYS,
    sameSite: "strict",
  });

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: REFRESH_TOKEN_EXPIRES_IN_DAYS,
    sameSite: "strict",
  });

  if (user) {
    Cookies.set(USER_KEY, JSON.stringify(user), {
      expires: REFRESH_TOKEN_EXPIRES_IN_DAYS,
      sameSite: "strict",
    });
  }
}

// Only update the access + refresh token (used after /auth/refresh-token,
// which does NOT return user info — see auth.service.ts refreshToken())
export function updateTokens(accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: ACCESS_TOKEN_EXPIRES_IN_DAYS,
    sameSite: "strict",
  });

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: REFRESH_TOKEN_EXPIRES_IN_DAYS,
    sameSite: "strict",
  });
}

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): CurrentUser | null {
  const raw = Cookies.get(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

// Small helper type: the `user` object returned inside
// POST /auth/login's data.user (see auth.service.ts login())
// is slightly different from CurrentUser (no isVerified, but
// same shape otherwise) — we accept either.
type LoginUserShape = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: CurrentUser["role"];
};