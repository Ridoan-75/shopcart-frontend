// src/app/(auth)/login/page.tsx
import type { Metadata } from "next";
import LoginForm from "../../../components/auth/LoginForm";
import SocialLogin from "../../../components/auth/SocialLogin";

export const metadata: Metadata = {
  title: "Sign In — ShopCart",
  description: "Sign in to your ShopCart account",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* heading */}
      <div className="text-center">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          Welcome back
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to your account to continue
        </p>
      </div>

      <LoginForm />
      <SocialLogin />
    </div>
  );
}