import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";
  const isUser = user?.role === "USER";

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    isSeller,
    isUser,
    setUser,
    logout,
  };
}