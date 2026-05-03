export type Role = "USER" | "ADMIN" | "SELLER";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  googleId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}