import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { Notification } from "../types/notification.types";

export const getNotifications = async () => {
  const res = await axiosInstance.get<ApiResponse<Notification[]>>("/notifications");
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await axiosInstance.patch<ApiResponse<null>>(
    `/notifications/${id}/read`
  );
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axiosInstance.patch<ApiResponse<null>>(
    "/notifications/read-all"
  );
  return res.data;
};

export const deleteNotification = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(
    `/notifications/${id}`
  );
  return res.data;
};