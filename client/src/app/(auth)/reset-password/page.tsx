"use client";

import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { resetPassword } from "@/src/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Check password reset flow
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("passwordResetEmail");
    const otpVerified = sessionStorage.getItem("passwordResetOtpVerified");

    // User should not access this page directly without verification
    if (!storedEmail || otpVerified !== "true") {
      router.replace("/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setPageLoading(false);
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const errorMessage = await resetPassword({
        email,
        newPassword,
      });

      if (errorMessage) {
        setError(errorMessage);
        return;
      }

      // Clear reset session
      sessionStorage.removeItem("passwordResetEmail");
      sessionStorage.removeItem("passwordResetOtpVerified");

      // Go to login
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Create a new password for your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                newPassword.length < 6 ||
                confirmPassword.length < 6
              }
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="hover:underline">
                ← Back to Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}