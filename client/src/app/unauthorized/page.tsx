"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";

export default function UnauthorizedPage() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-muted-foreground max-w-sm">
        Your account doesn&apos;t have permission to view this page.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go back</Link>
        </Button>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}