"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { Role } from "@/src/types/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One entry per section we'll build. Paths that don't exist yet
// will 404 if clicked — that's fine, we build them one at a time
// in the following roadmap steps. Having them listed now means we
// don't have to keep editing this file as we add each page.
const NAV_ITEMS = [
  { label: "Overview", href: "/admin" },
  { label: "Departments", href: "/admin/departments" },
  { label: "Doctors", href: "/admin/doctors" },
  { label: "Patients", href: "/admin/patients" },
  { label: "Appointments", href: "/admin/appointments" },
  { label: "Medical Records", href: "/admin/medical-records" },
  { label: "Prescriptions", href: "/admin/prescriptions" },
  { label: "Laboratories", href: "/admin/laboratories" },
  { label: "Laboratory Tests", href: "/admin/laboratory-tests" },
  { label: "Laboratory Orders", href: "/admin/laboratory-orders" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="px-4 py-5 border-b">
          <p className="font-semibold leading-tight">Hospital MS</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            // Exact match for "/admin" itself, prefix match for
            // nested routes (e.g. /admin/departments/123 still
            // highlights "Departments").
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3 space-y-2">
          <div className="px-1 text-xs text-muted-foreground">
            Signed in as
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}