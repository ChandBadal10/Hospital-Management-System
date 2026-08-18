"use client";

import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { verifyOtp } from "@/src/services/authService";
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

export default function VerifyOtpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Get email from previous page
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("passwordResetEmail");

    if (!storedEmail) {
      router.replace("/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setPageLoading(false);
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const errorMessage = await verifyOtp({
        email,
        otp: cleanOtp,
      });

      if (errorMessage) {
        setError(errorMessage);
        return;
      }

      // Mark OTP as verified
      sessionStorage.setItem("passwordResetOtpVerified", "true");

      // Go to reset password
      router.push("/reset-password");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeEmail() {
    sessionStorage.removeItem("passwordResetEmail");
    sessionStorage.removeItem("passwordResetOtpVerified");
    router.push("/forgot-password");
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
          <CardTitle className="text-2xl">Verify Security Code</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="text-muted-foreground">Sent code to:</p>
              <p className="break-all font-medium text-foreground">{email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtp(value);
                }}
                placeholder="123456"
                className="text-center text-lg font-semibold tracking-[0.5em]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={loading}
              className="text-xs text-muted-foreground hover:underline"
            >
              Change Email
            </button>

            <p className="pt-2 text-center text-sm text-muted-foreground">
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