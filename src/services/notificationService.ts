import { apiClient, PaginatedResponse } from './api';

export interface Notification {
  id: string;
  type: 'payment_initiated' | 'loan_initiated' | 'transfer_initiated' | 'system' | 'reminder';
  title: string;
  message: string;
  user_id: string;
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  type: 'payment_initiated' | 'loan_initiated' | 'transfer_initiated' | 'system' | 'reminder';
  title: string;
  message: string;
  user_id: string;
  data?: any;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  read?: boolean;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export class NotificationService {
  static async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications', filters);
  }

  static async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    return apiClient.post<Notification>('/notifications', notificationData);
  }

  static async markAsRead(id: string): Promise<Notification> {
    return apiClient.put<Notification>(`/notifications/${id}/read`);
  }

  static async deleteNotification(id: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${id}`);
  }
}