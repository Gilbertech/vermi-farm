import { apiClient, PaginatedResponse } from './api';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'chairperson' | 'member' | 'secretary' | 'treasurer' | 'admin' | 'super_admin';
  group_id?: string;
  balance: number;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  pin_reset_required?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  group_id?: string;
  balance: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  group_id?: string;
  balance?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  group_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_from?: string;
  created_to?: string;
  balance_min?: number;
  balance_max?: number;
  last_login_from?: string;
  last_login_to?: string;
}

export interface ResetPinResponse {
  new_pin: string;
  sms_sent: boolean;
  expires_at: string;
}

export interface UserTransaction {
  id: string;
  tx_code: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
  amount: number;
  fees: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  mpesa_receipt?: string;
  created_at: string;
}

export interface UserLoan {
  id: string;
  amount: number;
  repaid_amount: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'completed' | 'overdue';
  type: 'group' | 'individual';
  purpose: string;
  created_at: string;
}

export interface UserStats {
  total_transactions: number;
  total_amount_transacted: number;
  active_loans: number;
  total_borrowed: number;
  total_repaid: number;
  last_transaction_date?: string;
}

export interface BulkUserImport {
  users: CreateUserRequest[];
  group_id?: string;
  send_welcome_sms?: boolean;
}

export interface BulkUserImportResponse {
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string; user_data: any }>;
  created_users: User[];
}

export class UserService {
  // Enhanced user listing with advanced pagination
  static async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000), // Allow up to 1000 per page
      ...filters
    };
    return apiClient.get<PaginatedResponse<User>>('/users', params);
  }

  // Get all users without pagination (for dropdowns, etc.)
  static async getAllUsers(filters?: Omit<UserFilters, 'page' | 'limit'>): Promise<User[]> {
    return apiClient.get<User[]>('/users/all', filters);
  }

  // Enhanced user search with fuzzy matching
  static async searchUsers(query: string, limit = 20): Promise<User[]> {
    return apiClient.get<User[]>('/users/search', { q: query, limit });
  }

  static async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users', userData);
  }

  static async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, updates);
  }

  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  // Bulk operations
  static async bulkCreateUsers(data: BulkUserImport): Promise<BulkUserImportResponse> {
    return apiClient.post<BulkUserImportResponse>('/users/bulk', data);
  }

  static async bulkUpdateUsers(updates: Array<{ id: string; data: UpdateUserRequest }>): Promise<User[]> {
    return apiClient.put<User[]>('/users/bulk', { updates });
  }

  static async bulkDeleteUsers(userIds: string[]): Promise<{ deleted: number; errors: any[] }> {
    return apiClient.delete<{ deleted: number; errors: any[] }>('/users/bulk', { user_ids: userIds });
  }

  // Security operations
  static async resetUserPin(id: string): Promise<ResetPinResponse> {
    return apiClient.post<ResetPinResponse>(`/users/${id}/reset-pin`);
  }

  static async changeUserPassword(id: string, data: { current_password: string; new_password: string }): Promise<void> {
    return apiClient.post<void>(`/users/${id}/change-password`, data);
  }

  static async suspendUser(id: string, reason: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/suspend`, { reason });
  }

  static async activateUser(id: string): Promise<User> {
    return apiClient.post<User>(`/users/${id}/activate`);
  }

  // User data and analytics
  static async getUserTransactions(id: string, filters?: { 
    page?: number; 
    limit?: number; 
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<UserTransaction>> {
    return apiClient.get<PaginatedResponse<UserTransaction>>(`/users/${id}/transactions`, filters);
  }

  static async getUserLoans(id: string, filters?: { 
    page?: number; 
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<UserLoan>> {
    return apiClient.get<PaginatedResponse<UserLoan>>(`/users/${id}/loans`, filters);
  }

  static async getUserStats(id: string): Promise<UserStats> {
    return apiClient.get<UserStats>(`/users/${id}/stats`);
  }

  // Export/Import operations
  static async exportUsers(filters?: UserFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = { ...filters, format };
    const response = await fetch(`${apiClient['baseURL']}/users/export?${new URLSearchParams(params).toString()}`, {
      headers: apiClient['getHeaders'](),
    });

    if (!response.ok) {
      throw new Error('Failed to export users');
    }

    return response.blob();
  }

  static async importUsers(file: File): Promise<BulkUserImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<BulkUserImportResponse>('/users/import', formData);
  }

  // User verification and validation
  static async verifyUserPhone(id: string, otp: string): Promise<{ verified: boolean }> {
    return apiClient.post<{ verified: boolean }>(`/users/${id}/verify-phone`, { otp });
  }

  static async sendUserVerificationSMS(id: string): Promise<{ sent: boolean; expires_at: string }> {
    return apiClient.post<{ sent: boolean; expires_at: string }>(`/users/${id}/send-verification`);
  }

  // User activity tracking
  static async getUserActivity(id: string, filters?: {
    page?: number;
    limit?: number;
    action_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<{
    id: string;
    action: string;
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
  }>> {
    return apiClient.get<PaginatedResponse<any>>(`/users/${id}/activity`, filters);
  }


export { UserService };