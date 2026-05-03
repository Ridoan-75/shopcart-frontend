// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, Zap } from "lucide-react";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../stores/auth.store";
import { ROUTES } from "../../constants/routes";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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
        {rightElement && (
          <div className="px-3 flex-shrink-0">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="text-xs" style={{ color: "#f02757" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      setUser(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name?.split(" ")[0]}!`);
      const role = res.data.user.role;
      if (role === "ADMIN") router.push(ROUTES.ADMIN_OVERVIEW);
      else if (role === "SELLER") router.push(ROUTES.SELLER_OVERVIEW);
      else router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Login failed. Please try again.");
    }
  };

  const fillDemo = () => {
    setValue("email", "user@demo.com");
    setValue("password", "demo1234");
    toast.info("Demo credentials filled!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* demo button */}
      <button
        type="button"
        onClick={fillDemo}
        className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-85"
        style={{
          backgroundColor: "rgba(55,73,187,0.08)",
          color: "#3749bb",
          border: "1px solid rgba(55,73,187,0.25)",
        }}
      >
        <Zap size={15} />
        Try Demo Account
      </button>

      {/* divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          or sign in with email
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />
      </div>

      {/* email */}
      <InputField
        label="Email Address"
        icon={Mail}
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* password */}
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

      {/* forgot password */}
      <div className="flex justify-end -mt-2">
        <Link
          href={ROUTES.FORGOT_PASSWORD ?? "/forgot-password"}
          className="text-xs font-medium hover:underline"
          style={{ color: "#ef4a23" }}
        >
          Forgot password?
        </Link>
      </div>

      {/* submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        style={{ backgroundColor: "#ef4a23" }}
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Sign In"
        )}
      </button>

      {/* register link */}
      <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="font-semibold hover:underline"
          style={{ color: "#ef4a23" }}
        >
          Create one
        </Link>
      </p>
    </form>
  );
}