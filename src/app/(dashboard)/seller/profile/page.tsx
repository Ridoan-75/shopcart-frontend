// src/app/(dashboard)/seller/profile/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Save,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Store,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useAuthStore } from "../../../../stores/auth.store";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  storeName: z.string().optional(),
  storeDescription: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Required"),
    newPassword: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(6, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const INPUT_CLASS = "h-11 px-4 rounded-xl text-sm outline-none w-full transition-all";
const INPUT_STYLE = {
  backgroundColor: "var(--color-background-secondary)",
  border: "0.5px solid var(--color-border-secondary)",
  color: "var(--color-text-primary)",
};

function FormSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div>
        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
        {Icon && <Icon size={12} style={{ color: "#ef4a23" }} />}
        {label}
      </label>
      {children}
      {error && <p className="text-xs" style={{ color: "#f02757" }}>{error}</p>}
    </div>
  );
}

export default function SellerProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: () => axiosInstance.get("/users/me").then((r) => r.data),
  });

  const profile = data?.data ?? user;

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? "",
      phone: profile?.phone ?? "",
      bio: profile?.bio ?? "",
      address: profile?.address ?? "",
      website: profile?.website ?? "",
      storeName: profile?.storeName ?? "",
      storeDescription: profile?.storeDescription ?? "",
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const uploadAvatar = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "shopcart");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );
    return (await res.json()).secure_url;
  };

  const updateProfile = useMutation({
    mutationFn: (payload: ProfileForm & { avatar?: string }) =>
      axiosInstance.patch("/users/me", payload).then((r) => r.data),
    onSuccess: (data) => {
      toast.success("Profile updated!");
      setUser(data.data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const changePassword = useMutation({
    mutationFn: (payload: PasswordForm) =>
      axiosInstance.post("/auth/change-password", payload),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      resetPassword();
    },
    onError: () => toast.error("Current password is incorrect"),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    let avatarUrl = avatarPreview;
    if (avatarFile) {
      try {
        avatarUrl = await uploadAvatar(avatarFile);
      } catch {
        toast.error("Avatar upload failed");
        return;
      }
    }
    updateProfile.mutate({ ...data, avatar: avatarUrl });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const initials = profile?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Seller Profile
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Manage your public profile and store information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Avatar Card */}
        <div className="flex flex-col gap-5">
          <FormSection title="Profile Photo">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: "rgba(239,74,35,0.12)", color: "#ef4a23" }}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="avatar" fill className="object-cover" sizes="96px" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "#ef4a23" }}
                  type="button"
                >
                  <Camera size={14} />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{profile?.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{profile?.email}</p>
                <span
                  className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
                >
                  SELLER
                </span>
              </div>
            </div>
          </FormSection>

          {/* Quick Stats */}
          <FormSection title="Store Stats">
            {[
              { label: "Total Products", value: profile?.stats?.totalProducts ?? 0 },
              { label: "Total Orders", value: profile?.stats?.totalOrders ?? 0 },
              { label: "Total Revenue", value: `$${(profile?.stats?.totalRevenue ?? 0).toFixed(2)}` },
              { label: "Avg. Rating", value: `${(profile?.stats?.avgRating ?? 0).toFixed(1)} ★` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
                <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</span>
              </div>
            ))}
          </FormSection>
        </div>

        {/* Right — Forms */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Personal Info Form */}
          <form onSubmit={handleProfile(onProfileSubmit)}>
            <FormSection title="Personal Information" subtitle="Update your personal details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon={User} error={profileErrors.name?.message}>
                  <input {...regProfile("name")} className={INPUT_CLASS} style={INPUT_STYLE} placeholder="John Doe" />
                </Field>
                <Field label="Phone" icon={Phone} error={profileErrors.phone?.message}>
                  <input {...regProfile("phone")} className={INPUT_CLASS} style={INPUT_STYLE} placeholder="+1 (555) 000-0000" />
                </Field>
                <Field label="Address" icon={MapPin} error={profileErrors.address?.message}>
                  <input {...regProfile("address")} className={INPUT_CLASS} style={INPUT_STYLE} placeholder="Your address" />
                </Field>
                <Field label="Website" icon={Globe} error={profileErrors.website?.message}>
                  <input {...regProfile("website")} className={INPUT_CLASS} style={INPUT_STYLE} placeholder="https://yoursite.com" />
                </Field>
              </div>
              <Field label="Bio" error={profileErrors.bio?.message}>
                <textarea
                  {...regProfile("bio")}
                  rows={3}
                  className="px-4 py-3 rounded-xl text-sm outline-none w-full resize-none"
                  style={INPUT_STYLE}
                  placeholder="Tell customers about yourself..."
                />
              </Field>

              {/* Store Info */}
              <div
                className="pt-4 mt-2 border-t flex flex-col gap-4"
                style={{ borderColor: "var(--color-border-tertiary)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
                  Store Information
                </p>
                <Field label="Store Name" icon={Store} error={profileErrors.storeName?.message}>
                  <input {...regProfile("storeName")} className={INPUT_CLASS} style={INPUT_STYLE} placeholder="My Awesome Store" />
                </Field>
                <Field label="Store Description" error={profileErrors.storeDescription?.message}>
                  <textarea
                    {...regProfile("storeDescription")}
                    rows={3}
                    className="px-4 py-3 rounded-xl text-sm outline-none w-full resize-none"
                    style={INPUT_STYLE}
                    placeholder="Describe your store..."
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="self-end h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ backgroundColor: "#ef4a23" }}
              >
                {updateProfile.isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Save Changes
              </button>
            </FormSection>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handlePassword((d) => changePassword.mutate(d))}>
            <FormSection title="Change Password" subtitle="Keep your account secure">
              <Field label="Current Password" icon={Lock} error={passwordErrors.currentPassword?.message}>
                <div className="relative">
                  <input
                    {...regPassword("currentPassword")}
                    type={showCurrent ? "text" : "password"}
                    className={`${INPUT_CLASS} pr-11`}
                    style={INPUT_STYLE}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="New Password" error={passwordErrors.newPassword?.message}>
                  <div className="relative">
                    <input
                      {...regPassword("newPassword")}
                      type={showNew ? "text" : "password"}
                      className={`${INPUT_CLASS} pr-11`}
                      style={INPUT_STYLE}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowNew((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password" error={passwordErrors.confirmPassword?.message}>
                  <div className="relative">
                    <input
                      {...regPassword("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      className={`${INPUT_CLASS} pr-11`}
                      style={INPUT_STYLE}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              </div>

              <button
                type="submit"
                disabled={changePassword.isPending}
                className="self-end h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ backgroundColor: "#3749bb" }}
              >
                {changePassword.isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Lock size={15} />
                )}
                Update Password
              </button>
            </FormSection>
          </form>
        </div>
      </div>
    </div>
  );
}