"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Role } from "../types/auth";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  // If omitted, any logged-in user (any role) is allowed through.
  // If provided, only users whose role is in this list pass.
  allowedRoles?: Role[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // still checking cookies/profile — wait

    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Logged in, but wrong role for this section (e.g. a PATIENT
      // trying to open /admin). Send them to a neutral "not allowed"
      // page rather than silently showing nothing.
      router.push("/unauthorized");
    }
  }, [loading, user, allowedRoles, router]);

  // While we're checking auth state, or about to redirect, show a
  // simple loading state instead of flashing protected content.
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}