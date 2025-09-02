import { apiClient, PaginatedResponse } from './api';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  group_id?: string;
  balance: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  role: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  group_id?: string;
  balance: number;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  group_id?: string;
  balance?: number;
  status?: 'active' | 'inactive';
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  group_id?: string;
  status?: 'active' | 'inactive';
  created_from?: string;
  created_to?: string;
}

export interface ResetPinResponse {
  new_pin: string;
  sms_sent: boolean;
}

export interface UserTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export interface UserLoan {
  id: string;
  amount: number;
  repaid_amount: number;
  interest_rate: number;
  due_date: string;
  status: string;
  created_at: string;
}

export class UserService {
  static async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>('/users', filters);
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

  static async resetUserPin(id: string): Promise<ResetPinResponse> {
    return apiClient.post<ResetPinResponse>(`/users/${id}/reset-pin`);
  }

  static async getUserTransactions(id: string, filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<UserTransaction>> {
    return apiClient.get<PaginatedResponse<UserTransaction>>(`/users/${id}/transactions`, filters);
  }

  static async getUserLoans(id: string, filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<UserLoan>> {
    return apiClient.get<PaginatedResponse<UserLoan>>(`/users/${id}/loans`, filters);
  }
}