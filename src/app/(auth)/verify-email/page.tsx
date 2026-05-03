// src/app/(auth)/verify-email/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { authService } from "../../../services/auth.service";
import { ROUTES } from "../../../constants/routes";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // auto-focus next
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1 && newOtp.every((d) => d)) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
    if (pasted.length === OTP_LENGTH) handleVerify(pasted);
  };

  const handleVerify = async (code: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await authService.verifyEmail({ otp: code });
      toast.success("Email verified successfully!");
      router.push(ROUTES.LOGIN);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.resendVerification();
      toast.success("OTP resent to your email!");
      setResendCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
      >
        <Mail size={28} />
      </div>

      {/* heading */}
      <div className="text-center">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          Verify your email
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          We sent a 6-digit code to your email address. Enter it below to verify your account.
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex items-center gap-2.5" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-14 text-center text-xl font-black rounded-xl outline-none transition-all"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              border: digit
                ? "2px solid #ef4a23"
                : "1.5px solid var(--color-border-secondary)",
              color: "var(--color-text-primary)",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          />
        ))}
      </div>

      {/* progress bar */}
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(filled / OTP_LENGTH) * 100}%`,
            backgroundColor: "#ef4a23",
          }}
        />
      </div>

      {/* verify button */}
      <button
        onClick={() => handleVerify(otp.join(""))}
        disabled={filled < OTP_LENGTH || loading}
        className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#ef4a23" }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify Email"}
      </button>

      {/* resend */}
      <button
        onClick={handleResend}
        disabled={resendCooldown > 0}
        className="flex items-center gap-2 text-sm font-medium transition-opacity disabled:opacity-40"
        style={{ color: resendCooldown > 0 ? "var(--color-text-tertiary)" : "#ef4a23" }}
      >
        <RefreshCw size={14} />
        {resendCooldown > 0
          ? `Resend code in ${resendCooldown}s`
          : "Resend verification code"}
      </button>
    </div>
  );
}