// src/components/auth/RegisterForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { authService } from "../../services/auth.service";
import { ROUTES } from "../../constants/routes";
import Link from "next/link";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["#f02757", "#f59e0b", "#22c55e"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < score ? colors[score - 1] : "var(--color-border-tertiary)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className="text-[10px] flex items-center gap-1"
              style={{ color: c.pass ? "#22c55e" : "var(--color-text-tertiary)" }}
            >
              <span>{c.pass ? "✓" : "○"}</span>
              {c.label}
            </span>
          ))}
        </div>
        <span
          className="text-[10px] font-semibold"
          style={{ color: score > 0 ? colors[score - 1] : "var(--color-text-tertiary)" }}
        >
          {score > 0 ? labels[score - 1] : ""}
        </span>
      </div>
    </div>
  );
}

function InputField({
  label,
  icon: Icon,
  error,
  type = "text",
  placeholder,
  rightElement,
  ...props
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  type?: string;
  placeholder?: string;
  rightElement?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </label>
      <div
        className="flex items-center rounded-xl overflow-hidden transition-all"
        style={{
          border: error
            ? "1.5px solid #f02757"
            : "1px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-background-secondary)",
        }}
      >
        <div className="px-3 flex-shrink-0" style={{ color: "#ef4a23" }}>
          <Icon size={16} />
        </div>
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 h-12 text-sm bg-transparent outline-none"
          style={{
            color: "var(--color-text-primary)",
            fontFamily: "'Trebuchet MS', sans-serif",
          }}
          {...props}
        />
        {rightElement && <div className="px-3 flex-shrink-0">{rightElement}</div>}
      </div>
      {error && (
        <p className="text-xs" style={{ color: "#f02757" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created! Please verify your email.");
      router.push(ROUTES.VERIFY_EMAIL ?? "/verify-email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* name */}
      <InputField
        label="Full Name"
        icon={User}
        placeholder="John Doe"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* email */}
      <InputField
        label="Email Address"
        icon={Mail}
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* password */}
      <div className="flex flex-col gap-1">
        <InputField
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{ color: "var(--color-text-tertiary)" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          {...register("password")}
        />
        <PasswordStrength password={password} />
      </div>

      {/* confirm password */}
      <InputField
        label="Confirm Password"
        icon={Lock}
        type={showConfirm ? "text" : "password"}
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            style={{ color: "var(--color-text-tertiary)" }}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
        {...register("confirmPassword")}
      />

      {/* terms */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
        By creating an account, you agree to our{" "}
        <a href="/terms" className="font-semibold hover:underline" style={{ color: "#ef4a23" }}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="font-semibold hover:underline" style={{ color: "#ef4a23" }}>
          Privacy Policy
        </a>.
      </p>

      {/* submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#ef4a23" }}
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Create Account"
        )}
      </button>

      {/* login link */}
      <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="font-semibold hover:underline"
          style={{ color: "#ef4a23" }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}