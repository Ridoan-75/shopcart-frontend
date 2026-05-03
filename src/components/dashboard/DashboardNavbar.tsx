// src/components/dashboard/DashboardNavbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Sun, Moon, Bell, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { ROUTES } from "../../constants/routes";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark((p) => !p);
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        color: "var(--color-text-secondary)",
      }}
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function NotificationBell() {
  const [unread] = useState(3);

  return (
    <button
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        color: "var(--color-text-secondary)",
      }}
      aria-label="Notifications"
    >
      <Bell size={16} />
      {unread > 0 && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ backgroundColor: "#ef4a23" }}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

function AvatarDropdown() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const dashboardHref =
    user?.role === "ADMIN"
      ? ROUTES.ADMIN_OVERVIEW
      : user?.role === "SELLER"
      ? ROUTES.SELLER_OVERVIEW
      : ROUTES.DASHBOARD;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
        style={{
          backgroundColor: "rgba(239,74,35,0.1)",
          color: "#ef4a23",
          border: "1.5px solid rgba(239,74,35,0.25)",
        }}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "var(--color-border-tertiary)" }}
          >
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {user?.name}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              {user?.email}
            </p>
          </div>

          {[
            { icon: LayoutDashboard, label: "Dashboard", href: dashboardHref },
            { icon: User, label: "Profile", href: ROUTES.USER_PROFILE },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}

          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border-t transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            style={{ color: "#f02757", borderColor: "var(--color-border-tertiary)" }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { user } = useAuthStore();

  return (
    <header
      className="h-16 flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30"
      style={{
        backgroundColor: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* left */}
      <div className="flex items-center gap-3">
        {/* mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: "var(--color-text-primary)",
          }}
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            {user?.role === "ADMIN"
              ? "Admin Dashboard"
              : user?.role === "SELLER"
              ? "Seller Dashboard"
              : "My Dashboard"}
          </p>
          <p className="text-xs hidden sm:block" style={{ color: "var(--color-text-tertiary)" }}>
            Welcome back, {user?.name?.split(" ")[0]}
          </p>
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <AvatarDropdown />
      </div>
    </header>
  );
}