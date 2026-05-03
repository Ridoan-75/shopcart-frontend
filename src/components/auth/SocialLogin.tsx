// src/components/auth/SocialLogin.tsx
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../stores/auth.store";
import { ROUTES } from "../../constants/routes";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function GoogleButton() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await authService.googleLogin({ token: tokenResponse.access_token });
        setUser(res.data.user, res.data.token);
        toast.success(`Welcome, ${res.data.user.name?.split(" ")[0]}!`);
        const role = res.data.user.role;
        if (role === "ADMIN") router.push(ROUTES.ADMIN_OVERVIEW);
        else if (role === "SELLER") router.push(ROUTES.SELLER_OVERVIEW);
        else router.push(ROUTES.DASHBOARD);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login was cancelled");
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        border: "1px solid var(--color-border-secondary)",
        color: "var(--color-text-primary)",
      }}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" style={{ color: "#ef4a23" }} />
      ) : (
        /* Google SVG icon */
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path
            d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            fill="#FFC107"
          />
          <path
            d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            fill="#FF3D00"
          />
          <path
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.311 0-9.818-3.37-11.402-8.009l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            fill="#4CAF50"
          />
          <path
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            fill="#1976D2"
          />
        </svg>
      )}
      Continue with Google
    </button>
  );
}

export default function SocialLogin() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col gap-4">
        {/* divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            or continue with
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />
        </div>

        <GoogleButton />
      </div>
    </GoogleOAuthProvider>
  );
}