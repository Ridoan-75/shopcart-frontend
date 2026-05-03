// src/app/(dashboard)/user/profile/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { User, Lock, Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../../../stores/auth.store";
import { userService } from "../../../../services/user.service";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}>
          <Icon size={15} />
        </div>
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs" style={{ color: "#f02757" }}>{error}</p>}
    </div>
  );
}

const inputStyle = (hasError?: boolean) => ({
  height: "44px",
  paddingLeft: "16px",
  paddingRight: "16px",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "var(--color-background-secondary)",
  border: hasError ? "1.5px solid #f02757" : "1px solid var(--color-border-secondary)",
  color: "var(--color-text-primary)",
  fontFamily: "'Trebuchet MS', sans-serif",
  width: "100%",
});

export default function UserProfilePage() {
  const { user, setUser } = useAuthStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: (data: ProfileData) => userService.updateMe(data),
    onSuccess: (res) => {
      setUser(res.data, undefined);
      toast.success("Profile updated successfully!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: (data: PasswordData) => userService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      resetPassword();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to change password"),
  });

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <h1 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>My Profile</h1>

      {/* avatar */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
      >
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23", border: "2px solid rgba(239,74,35,0.2)" }}
          >
            {initials}
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: "#ef4a23" }}
            aria-label="Change avatar"
          >
            <Camera size={13} />
          </button>
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{user?.name}</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{user?.email}</p>
          <span
            className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
          >
            {user?.role ?? "USER"}
          </span>
        </div>
      </div>

      {/* profile form */}
      <SectionCard icon={User} title="Personal Information">
        <form onSubmit={handleProfile((d) => updateProfile(d))} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputRow label="Full Name" error={profileErrors.name?.message}>
              <input {...regProfile("name")} style={inputStyle(!!profileErrors.name)} />
            </InputRow>
            <InputRow label="Phone Number" error={profileErrors.phone?.message}>
              <input {...regProfile("phone")} style={inputStyle(!!profileErrors.phone)} placeholder="+1 (555) 000-0000" />
            </InputRow>
          </div>
          <InputRow label="Email Address">
            <input
              value={user?.email ?? ""}
              disabled
              style={{ ...inputStyle(), opacity: 0.5, cursor: "not-allowed" }}
            />
          </InputRow>
          <button
            type="submit"
            disabled={updatingProfile}
            className="self-start h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ backgroundColor: "#ef4a23" }}
          >
            {updatingProfile ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Changes
          </button>
        </form>
      </SectionCard>

      {/* password form */}
      <SectionCard icon={Lock} title="Change Password">
        <form onSubmit={handlePassword((d) => changePassword(d))} className="flex flex-col gap-4">
          <InputRow label="Current Password" error={passwordErrors.currentPassword?.message}>
            <div className="relative">
              <input
                {...regPassword("currentPassword")}
                type={showCurrent ? "text" : "password"}
                style={{ ...inputStyle(!!passwordErrors.currentPassword), paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowCurrent((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </InputRow>
          <InputRow label="New Password" error={passwordErrors.newPassword?.message}>
            <div className="relative">
              <input
                {...regPassword("newPassword")}
                type={showNew ? "text" : "password"}
                style={{ ...inputStyle(!!passwordErrors.newPassword), paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowNew((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </InputRow>
          <InputRow label="Confirm New Password" error={passwordErrors.confirmPassword?.message}>
            <div className="relative">
              <input
                {...regPassword("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                style={{ ...inputStyle(!!passwordErrors.confirmPassword), paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </InputRow>
          <button
            type="submit"
            disabled={changingPassword}
            className="self-start h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ backgroundColor: "#ef4a23" }}
          >
            {changingPassword ? <Loader2 size={14} className="animate-spin" /> : null}
            Update Password
          </button>
        </form>
      </SectionCard>
    </div>
  );
}