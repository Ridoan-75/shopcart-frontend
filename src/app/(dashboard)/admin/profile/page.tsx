// src/app/(dashboard)/admin/profile/page.tsx
"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera, Eye, EyeOff, Save, Shield } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useAuthStore } from "../../../../stores/auth.store";
import { userService } from "../../../../services/user.service";
import axiosInstance from "../../../../lib/axios";

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
        >
          <Icon size={16} />
        </div>
        <h2 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    avatar: user?.avatar ?? "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileMutation = useMutation({
    mutationFn: (payload: { name: string; phone: string; avatar: string }) =>
      userService.updateMe(payload),
    onSuccess: (data) => {
      setUser(data.data);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: {
      currentPassword: string;
      newPassword: string;
    }) => axiosInstance.patch("/auth/change-password", payload),
    onSuccess: () => {
      toast.success("Password changed!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: () => toast.error("Failed to change password. Check your current password."),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "shopcart"
      );
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      setAvatarPreview(data.secure_url);
      setProfileForm((p) => ({ ...p, avatar: data.secure_url }));
      toast.success("Avatar uploaded!");
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = () => {
    if (!profileForm.name.trim()) return toast.error("Name is required");
    profileMutation.mutate(profileForm);
  };

  const handlePasswordSave = () => {
    if (!passwordForm.currentPassword) return toast.error("Current password is required");
    if (!passwordForm.newPassword) return toast.error("New password is required");
    if (passwordForm.newPassword.length < 8)
      return toast.error("New password must be at least 8 characters");
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error("Passwords do not match");
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Profile
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Manage your admin account settings
        </p>
      </div>

      {/* profile info */}
      <SectionCard title="Personal Information" icon={Camera}>
        {/* avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(239,74,35,0.1)",
                border: "2px solid rgba(239,74,35,0.2)",
              }}
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="avatar"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-black" style={{ color: "#ef4a23" }}>
                  {initials}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#ef4a23" }}
            >
              {uploadingAvatar ? (
                <div
                  className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                  style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                />
              ) : (
                <Camera size={13} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
              {user?.name}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {user?.email}
            </p>
            <span
              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label
              className="text-xs font-bold uppercase tracking-widest mb-2 block"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Your full name"
              className="w-full h-10 px-3 rounded-xl text-sm outline-none"
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label
              className="text-xs font-bold uppercase tracking-widest mb-2 block"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full h-10 px-3 rounded-xl text-sm outline-none opacity-50 cursor-not-allowed"
              style={INPUT_STYLE}
            />
          </div>

          <div>
            <label
              className="text-xs font-bold uppercase tracking-widest mb-2 block"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Phone
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+1 (555) 000-0000"
              className="w-full h-10 px-3 rounded-xl text-sm outline-none"
              style={INPUT_STYLE}
            />
          </div>

          <button
            onClick={handleProfileSave}
            disabled={profileMutation.isPending}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 w-full mt-1"
            style={{ backgroundColor: "#ef4a23" }}
          >
            <Save size={15} />
            {profileMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </SectionCard>

      {/* change password */}
      <SectionCard title="Change Password" icon={Shield}>
        <div className="flex flex-col gap-4">
          {[
            {
              label: "Current Password",
              key: "currentPassword" as const,
              show: showCurrent,
              toggle: () => setShowCurrent((p) => !p),
            },
            {
              label: "New Password",
              key: "newPassword" as const,
              show: showNew,
              toggle: () => setShowNew((p) => !p),
            },
            {
              label: "Confirm New Password",
              key: "confirmPassword" as const,
              show: showConfirm,
              toggle: () => setShowConfirm((p) => !p),
            },
          ].map((field) => (
            <div key={field.key}>
              <label
                className="text-xs font-bold uppercase tracking-widest mb-2 block"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.show ? "text" : "password"}
                  value={passwordForm[field.key]}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                  className="w-full h-10 pl-3 pr-10 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                />
                <button
                  onClick={field.toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-tertiary)" }}
                  type="button"
                >
                  {field.show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {/* strength hint */}
          {passwordForm.newPassword && (
            <div className="flex gap-1.5">
              {[8, 12, 16].map((len) => (
                <div
                  key={len}
                  className="flex-1 h-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      passwordForm.newPassword.length >= len
                        ? "#ef4a23"
                        : "var(--color-background-secondary)",
                  }}
                />
              ))}
              <p
                className="text-xs ml-1 self-center"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {passwordForm.newPassword.length < 8
                  ? "Too short"
                  : passwordForm.newPassword.length < 12
                  ? "Fair"
                  : "Strong"}
              </p>
            </div>
          )}

          <button
            onClick={handlePasswordSave}
            disabled={passwordMutation.isPending}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 w-full mt-1"
            style={{ backgroundColor: "#ef4a23" }}
          >
            <Shield size={15} />
            {passwordMutation.isPending ? "Changing..." : "Change Password"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}