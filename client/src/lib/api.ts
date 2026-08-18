import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  updateTokens,
  clearAuthSession,
} from "../lib/auth";
import { ApiResponse, RefreshTokenResponseData } from "../types/auth";

// ─────────────────────────────────────────────────────────
// Base instance — every request goes through here.
// NEXT_PUBLIC_API_URL should be http://localhost:5000/api
// (matches app.setGlobalPrefix('api') in your NestJS main.ts)
// ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Attach the access token to every outgoing request, if present.
// ─────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — the tricky part.
//
// When the access token expires, your JwtStrategy throws
// UnauthorizedException (401). We catch that here, call
// POST /auth/refresh-token with the stored refresh token,
// save the new tokens, and retry the original request ONCE.
//
// If multiple requests fail at the same time (e.g. a page
// fires 3 API calls at once and the token just expired), we
// don't want to fire 3 separate refresh calls. So we queue
// any requests that come in while a refresh is already in
// flight, and resolve them all once the single refresh finishes.
// ─────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Extend the config type so we can mark a request as "already retried"
// and avoid an infinite retry loop if refresh itself keeps failing.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  // Any successful response just passes through untouched.
  (response) => response,

  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableRequestConfig;

    // Not a 401, or there's no config to retry (shouldn't happen) — bail out.
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Don't try to refresh when the FAILING request IS the refresh
    // call itself, or the login call — that would loop forever.
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/login");

    if (isAuthEndpoint) {
      clearAuthSession();
      return Promise.reject(error);
    }

    // Already retried once — refresh must not have fixed it. Give up.
    if (originalRequest._retry) {
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // If a refresh is already happening (triggered by another
    // request), just wait for it instead of firing a second one.
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // Matches: POST /auth/refresh-token, body: { refreshToken }
      // See auth.controller.ts refreshToken() + auth.service.ts
      const { data } = await axios.post<ApiResponse<RefreshTokenResponseData>>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        { refreshToken },
      );

      if (!data.success) {
        throw new Error(data.message);
      }

      const { accessToken, refreshToken: newRefreshToken } = data.data;
      updateTokens(accessToken, newRefreshToken);

      isRefreshing = false;
      onRefreshed(accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;