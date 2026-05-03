// src/app/(auth)/reset-password/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { authService } from "../../../services/auth.service";
import Link from "next/link";
import { ROUTES } from "../../../constants/routes";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }
    try {
      await authService.resetPassword({ token, password: data.password });
      toast.success("Password reset successfully!");
      router.push(ROUTES.LOGIN);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Reset failed. The link may have expired.");
    }
  };

  if (!token) {
    return (
      <div className="text-center flex flex-col gap-4">
        <p className="text-sm" style={{ color: "#f02757" }}>
          Invalid or expired reset link.
        </p>
        <Link
          href={ROUTES.FORGOT_PASSWORD ?? "/forgot-password"}
          className="text-sm font-semibold hover:underline"
          style={{ color: "#ef4a23" }}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          Reset your password
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Choose a strong new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* new password */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            New Password
          </label>
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              border: errors.password ? "1.5px solid #f02757" : "1px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
          >
            <div className="px-3" style={{ color: "#ef4a23" }}>
              <Lock size={16} />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="flex-1 h-12 text-sm bg-transparent outline-none"
              style={{ color: "var(--color-text-primary)", fontFamily: "'Trebuchet MS', sans-serif" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="px-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs" style={{ color: "#f02757" }}>{errors.password.message}</p>
          )}
        </div>

        {/* confirm password */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Confirm Password
          </label>
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              border: errors.confirmPassword ? "1.5px solid #f02757" : "1px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
          >
            <div className="px-3" style={{ color: "#ef4a23" }}>
              <Lock size={16} />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className="flex-1 h-12 text-sm bg-transparent outline-none"
              style={{ color: "var(--color-text-primary)", fontFamily: "'Trebuchet MS', sans-serif" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="px-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs" style={{ color: "#f02757" }}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ backgroundColor: "#ef4a23" }}
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Reset Password"}
        </button>
      </form>

      <Link
        href={ROUTES.LOGIN}
        className="flex items-center justify-center gap-2 text-sm font-medium hover:underline"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}