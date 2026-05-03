// src/app/(auth)/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ShopCart — Auth",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--color-background-tertiary, #f2f4f8)" }}
    >
      {/* logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg transition-transform group-hover:scale-105"
          style={{ backgroundColor: "#ef4a23" }}
        >
          S
        </div>
        <span className="text-2xl font-black tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Shop<span style={{ color: "#ef4a23" }}>Cart</span>
        </span>
      </Link>

      {/* card */}
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>

      {/* footer note */}
      <p className="mt-6 text-xs text-center" style={{ color: "var(--color-text-tertiary)" }}>
        © {new Date().getFullYear()} ShopCart. All rights reserved.
      </p>
    </div>
  );
}