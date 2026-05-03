// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authService } from "../../../services/auth.service";
import Link from "next/link";
import { ROUTES } from "../../../constants/routes";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e" }}
        >
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>
            Check your inbox
          </h2>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            We sent a password reset link to{" "}
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {sentEmail}
            </span>
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Didn't receive it? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="font-semibold hover:underline"
            style={{ color: "#ef4a23" }}
          >
            try again
          </button>
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "#ef4a23" }}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          Forgot password?
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Email Address
          </label>
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              border: errors.email ? "1.5px solid #f02757" : "1px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-secondary)",
            }}
          >
            <div className="px-3" style={{ color: "#ef4a23" }}>
              <Mail size={16} />
            </div>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="flex-1 h-12 text-sm bg-transparent outline-none"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            />
          </div>
          {errors.email && (
            <p className="text-xs" style={{ color: "#f02757" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ backgroundColor: "#ef4a23" }}
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
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