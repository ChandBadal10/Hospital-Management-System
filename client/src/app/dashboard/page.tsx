"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Basic route guard: if we're done loading and there's no user,
  // bounce to /login. We'll formalize this into a reusable
  // <ProtectedRoute> / layout guard in the next roadmap step —
  // this inline version is just so we can test the flow right now.
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Briefly rendered while the redirect above kicks in.
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">
          Welcome, {user.firstName} {user.lastName}
        </h1>

        <div className="rounded-md border p-4 text-sm space-y-1">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-medium">User ID:</span> {user.id}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          This is a temporary placeholder — we&apos;ll build the real
          role-based dashboard layout in the next step.
        </p>

        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}