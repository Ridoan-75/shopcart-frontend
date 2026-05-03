import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { Review, CreateReviewPayload, UpdateReviewPayload } from "../types/review.types";

export const getProductReviews = async (
  productId: string,
  params: { page?: number; limit?: number }
) => {
  const res = await axiosInstance.get<PaginatedResponse<Review>>(
    `/reviews/product/${productId}`,
    { params }
  );
  return res.data;
};

export const submitReview = async (payload: CreateReviewPayload) => {
  const res = await axiosInstance.post<ApiResponse<Review>>("/reviews", payload);
  return res.data;
};

export const updateReview = async (
  id: string,
  payload: UpdateReviewPayload
) => {
  const res = await axiosInstance.patch<ApiResponse<Review>>(
    `/reviews/${id}`,
    payload
  );
  return res.data;
};

export const deleteReview = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/reviews/${id}`);
  return res.data;
};

export const approveReview = async (id: string) => {
  const res = await axiosInstance.patch<ApiResponse<Review>>(
    `/reviews/${id}/approve`
  );
  return res.data;
};

export const getAllReviews = async (params: {
  page?: number;
  limit?: number;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<Review>>("/reviews", {
    params,
  });
  return res.data;
};