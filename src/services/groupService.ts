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
  member_count: number;
  status: 'active' | 'inactive' | 'suspended';
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
  initial_members?: string[];
}

export interface UpdateGroupRequest {
  name?: string;
  reg_no?: string;
  location?: string;
  description?: string;
  admin_id?: string;
  loan_limit?: number;
  interest_rate?: number;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateExecutivesRequest {
  secretary?: string;
  chairperson?: string;
  treasurer?: string;
}

export interface UpdateLoanLimitRequest {
  loan_limit: number;
  reason?: string;
}

export interface UpdateInterestRateRequest {
  interest_rate: number;
  effective_date?: string;
  reason?: string;
}

export interface GroupFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  admin_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_from?: string;
  created_to?: string;
  balance_min?: number;
  balance_max?: number;
  member_count_min?: number;
  member_count_max?: number;
}

export interface GroupMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  balance: number;
  status: 'active' | 'inactive';
  joined_at: string;
  last_activity?: string;
}

export interface GroupTransaction {
  id: string;
  tx_code: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
  amount: number;
  fees: number;
  user_id: string;
  user_name: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  mpesa_receipt?: string;
  created_at: string;
}

export interface GroupStats {
  total_members: number;
  active_members: number;
  total_balance: number;
  total_transactions: number;
  total_loans: number;
  active_loans: number;
  total_disbursed: number;
  total_repaid: number;
  average_member_balance: number;
  growth_rate: number;
}

export interface AddMemberRequest {
  user_id: string;
  role?: 'member' | 'secretary' | 'chairperson' | 'treasurer';
  initial_balance?: number;
}

export interface RemoveMemberRequest {
  user_id: string;
  reason?: string;
  transfer_balance_to?: string;
}

export class GroupService {
  // Enhanced group listing with advanced pagination
  static async getGroups(filters?: GroupFilters): Promise<PaginatedResponse<Group>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000), // Allow up to 1000 per page
      ...filters
    };
    return apiClient.get<PaginatedResponse<Group>>('/groups', params);
  }

  // Get all groups without pagination
  static async getAllGroups(filters?: Omit<GroupFilters, 'page' | 'limit'>): Promise<Group[]> {
    return apiClient.get<Group[]>('/groups/all', filters);
  }

  // Enhanced group search
  static async searchGroups(query: string, limit = 20): Promise<Group[]> {
    return apiClient.get<Group[]>('/groups/search', { q: query, limit });
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

  // Executive management
  static async updateExecutives(id: string, executives: UpdateExecutivesRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}/executives`, executives);
  }

  static async getExecutives(id: string): Promise<{
    secretary?: GroupMember;
    chairperson?: GroupMember;
    treasurer?: GroupMember;
  }> {
    return apiClient.get<any>(`/groups/${id}/executives`);
  }

  // Financial management
  static async updateLoanLimit(id: string, data: UpdateLoanLimitRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}/loan-limit`, data);
  }

  static async updateInterestRate(id: string, data: UpdateInterestRateRequest): Promise<Group> {
    return apiClient.put<Group>(`/groups/${id}/interest-rate`, data);
  }

  static async getFinancialHistory(id: string, filters?: {
    page?: number;
    limit?: number;
    change_type?: 'loan_limit' | 'interest_rate';
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<{
    id: string;
    change_type: string;
    old_value: number;
    new_value: number;
    reason?: string;
    changed_by: string;
    created_at: string;
  }>> {
    return apiClient.get<PaginatedResponse<any>>(`/groups/${id}/financial-history`, filters);
  }

  // Member management
  static async getGroupMembers(id: string, filters?: { 
    page?: number; 
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<GroupMember>> {
    return apiClient.get<PaginatedResponse<GroupMember>>(`/groups/${id}/members`, filters);
  }

  static async addMember(id: string, memberData: AddMemberRequest): Promise<GroupMember> {
    return apiClient.post<GroupMember>(`/groups/${id}/members`, memberData);
  }

  static async removeMember(id: string, data: RemoveMemberRequest): Promise<void> {
    return apiClient.delete<void>(`/groups/${id}/members/${data.user_id}`, data);
  }

  static async updateMemberRole(groupId: string, userId: string, role: string): Promise<GroupMember> {
    return apiClient.patch<GroupMember>(`/groups/${groupId}/members/${userId}`, { role });
  }

  // Transaction management
  static async getGroupTransactions(id: string, filters?: { 
    page?: number; 
    limit?: number;
    type?: string;
    status?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
  }): Promise<PaginatedResponse<GroupTransaction>> {
    return apiClient.get<PaginatedResponse<GroupTransaction>>(`/groups/${id}/transactions`, filters);
  }

  // Analytics and reporting
  static async getGroupStats(id: string): Promise<GroupStats> {
    return apiClient.get<GroupStats>(`/groups/${id}/stats`);
  }

  static async getGroupAnalytics(id: string, filters?: {
    date_from?: string;
    date_to?: string;
    metric_type?: 'transactions' | 'loans' | 'members' | 'revenue';
  }): Promise<{
    transactions_by_month: Record<string, number>;
    loans_by_status: Record<string, number>;
    member_growth: Record<string, number>;
    revenue_by_source: Record<string, number>;
  }> {
    return apiClient.get<any>(`/groups/${id}/analytics`, filters);
  }

  // Bulk operations
  static async bulkUpdateGroups(updates: Array<{ id: string; data: UpdateGroupRequest }>): Promise<Group[]> {
    return apiClient.put<Group[]>('/groups/bulk', { updates });
  }

  // Export/Import
  static async exportGroups(filters?: GroupFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = { ...filters, format };
    const response = await fetch(`${apiClient['baseURL']}/groups/export?${new URLSearchParams(params).toString()}`, {
      headers: apiClient['getHeaders'](),
    });

    if (!response.ok) {
      throw new Error('Failed to export groups');
    }

    return response.blob();
  }

  // Group validation
  static async validateGroupData(groupData: Partial<CreateGroupRequest>): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return apiClient.post<any>('/groups/validate', groupData);
  }

  // Group merging (for consolidating groups)
  static async mergeGroups(sourceGroupId: string, targetGroupId: string, options?: {
    transfer_members?: boolean;
    transfer_balance?: boolean;
    merge_transactions?: boolean;
  }): Promise<Group> {
    return apiClient.post<Group>(`/groups/${targetGroupId}/merge`, {
      source_group_id: sourceGroupId,
      ...options
    });
  }
}