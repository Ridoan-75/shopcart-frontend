import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { Blog, BlogCategory, BlogComment } from "../types/blog.types";

export const getBlogs = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<Blog>>("/blogs", {
    params,
  });
  return res.data;
};

export const getBlog = async (slug: string) => {
  const res = await axiosInstance.get<ApiResponse<Blog>>(`/blogs/${slug}`);
  return res.data;
};

export const getFeaturedBlogs = async () => {
  const res = await axiosInstance.get<PaginatedResponse<Blog>>(
    "/blogs/featured"
  );
  return res.data;
};

export const getBlogCategories = async () => {
  const res = await axiosInstance.get<ApiResponse<BlogCategory[]>>(
    "/blog-categories"
  );
  return res.data;
};

export const getBlogComments = async (blogId: string) => {
  const res = await axiosInstance.get<ApiResponse<BlogComment[]>>(
    `/blog-comments/${blogId}`
  );
  return res.data;
};

export const submitBlogComment = async (payload: {
  blogId: string;
  body: string;
  parentId?: string;
}) => {
  const res = await axiosInstance.post<ApiResponse<BlogComment>>(
    "/blog-comments",
    payload
  );
  return res.data;
};