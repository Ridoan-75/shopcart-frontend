// src/app/not-found.tsx
import Link from "next/link";
import { ROUTES } from "../constants/routes";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--color-background-tertiary, #f2f4f8)" }}
    >
      {/* illustration */}
      <div className="relative mb-8">
        <p
          className="text-[120px] md:text-[180px] font-black leading-none select-none"
          style={{ color: "rgba(239,74,35,0.08)" }}
        >
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <p className="text-5xl md:text-7xl font-black" style={{ color: "#ef4a23" }}>
              404
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-black mb-3" style={{ color: "var(--color-text-primary)" }}>
        Page Not Found
      </h1>
      <p
        className="text-sm max-w-sm leading-relaxed mb-8"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ROUTES.HOME}
          className="h-11 px-8 rounded-xl text-sm font-bold text-white flex items-center justify-center transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          Go Home
        </Link>
        <Link
          href={ROUTES.PRODUCTS}
          className="h-11 px-8 rounded-xl text-sm font-medium flex items-center justify-center transition-colors"
          style={{
            border: "1px solid var(--color-border-secondary)",
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-background-primary)",
          }}
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}