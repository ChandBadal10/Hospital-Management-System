
// Matches: server/src/users/enums/role.enum.ts

export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  RECEPTIONIST = "RECEPTIONIST",
  LAB_TECHNICIAN = "LAB_TECHNICIAN",
  PHARMACIST = "PHARMACIST",
  PATIENT = "PATIENT",
}


// Matches: server/src/auth/interfaces/current-user.interface.ts
// This is what GET /auth/profile returns as `data`

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}


// Request payloads — match the backend DTOs field-for-field


// Matches: server/src/auth/dto/register.ts
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  // role is optional on the backend but defaults to PATIENT —
  // we won't send it from the public register form
}

// Matches: server/src/auth/dto/login.dto.ts
export interface LoginPayload {
  email: string;
  password: string;
}

// Matches: server/src/auth/dto/forgot-password.dto.ts
export interface ForgotPasswordPayload {
  email: string;
}

// Matches: server/src/auth/dto/verify-otp.dto.ts
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// Matches: server/src/auth/dto/reset-password.dto.ts
export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}


// Response shapes — every endpoint in your backend returns
// { success, message, data } or { success, message, error }


export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// Matches the `data` object inside POST /auth/login's response
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

// Matches the `data` object inside POST /auth/refresh-token's response
export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

// Matches the `data` object inside POST /auth/register's response
export interface RegisterResponseData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}