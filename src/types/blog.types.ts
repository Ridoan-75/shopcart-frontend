import { User } from "./user.types";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  parentId: string | null;
  body: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  replies?: BlogComment[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  categoryId: string;
  authorId: string | null;
  status: BlogStatus;
  isFeatured: boolean;
  tags: string[];
  views: number;
  readingTime: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: BlogCategory;
  comments?: BlogComment[];
}