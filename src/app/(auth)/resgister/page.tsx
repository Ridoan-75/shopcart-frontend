// src/app/(auth)/register/page.tsx
import type { Metadata } from "next";
import RegisterForm from "../../../components/auth/RegisterForm";
import SocialLogin from "../../../components/auth/SocialLogin";

export const metadata: Metadata = {
  title: "Create Account — ShopCart",
  description: "Create a new ShopCart account",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* heading */}
      <div className="text-center">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          Create your account
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Join thousands of happy shoppers
        </p>
      </div>

      <RegisterForm />
      <SocialLogin />
    </div>
  );
}