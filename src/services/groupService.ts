import { apiClient, PaginatedResponse } from './api';

export interface Group {
  id: string;
  name: string;
  reg_no?: string;
  location?: string;
  description: string;
  admin_id: string;
  total_balance: number;
  loan_limit: number;
  interest_rate: number;
  active_loans: number;
  total_disbursed: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupRequest {
  name: string;
  reg_no?: string;
  location?: string;
  description: string;
  admin_id: string;
  loan_limit: number;
  interest_rate: number;
}

export interface UpdateGroupRequest {
  name?: string;
  reg_no?: string;
  location?: string;
  description?: string;
  admin_id?: string;
  loan_limit?: number;
  interest_rate?: number;
}

export interface UpdateExecutivesRequest {
  secretary: string;
  chairperson: string;
  treasurer: string;
}

export interface UpdateLoanLimitRequest {
  loan_limit: number;
}

export interface UpdateInterestRateRequest {
  interest_rate: number;
}

export interface GroupFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  admin_id?: string;
  created_from?: string;
  created_to?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  balance: number;
  status: string;
  joined_at: string;
}

export interface GroupTransaction {
  id: string;
  type: string;
  amount: number;
  user_id: string;
  description: string;
  status: string;
  created_at: string;
}

export class GroupService {
  static async getGroups(filters?: GroupFilters): Promise<PaginatedResponse<Group>> {
    return apiClient.get<PaginatedResponse<Group>>('/groups', filters);
  }

  static async getGroupById(id: string): Promise<Group> {
    return apiClient.get<Group>(`/groups/${id}`);
  }

  static async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    return apiClient.post<Group>('/groups', groupData);
  }

  static async updateGroup(id: string, updates: UpdateGroupRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}`, updates);
  }

  static async deleteGroup(id: string): Promise<void> {
    return apiClient.delete<void>(`/groups/${id}`);
  }

  static async updateExecutives(id: string, executives: UpdateExecutivesRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}/executives`, executives);
  }

  static async updateLoanLimit(id: string, data: UpdateLoanLimitRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}/loan-limit`, data);
  }

  static async updateInterestRate(id: string, data: UpdateInterestRateRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}/interest-rate`, data);
  }

  static async getGroupMembers(id: string, filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<GroupMember>> {
    return apiClient.get<PaginatedResponse<GroupMember>>(`/groups/${id}/members`, filters);
  }

  static async getGroupTransactions(id: string, filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<GroupTransaction>> {
    return apiClient.get<PaginatedResponse<GroupTransaction>>(`/groups/${id}/transactions`, filters);
  }
}