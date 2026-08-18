export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  RECEPTIONIST = "RECEPTIONIST",
  LAB_TECHNICIAN = "LAB_TECHNICIAN",
  PHARMACIST = "PHARMACIST",
  PATIENT = "PATIENT",
}

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

// ─────────────────────────────────────────────
// REQUEST PAYLOADS
// ─────────────────────────────────────────────

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

// ─────────────────────────────────────────────
// API RESPONSE
// ─────────────────────────────────────────────

export interface ApiSuccess<T = null> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T = null> =
  | ApiSuccess<T>
  | ApiFailure;

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

export interface RegisterResponseData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}