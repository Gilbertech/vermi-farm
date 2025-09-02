import { apiClient, PaginatedResponse } from './api';

export interface ReversalRequest {
  id: string;
  tx_code: string;
  initiated_by: string;
  transaction_type: string;
  amount: number;
  transaction_time: string;
  from_account: string;
  to_account: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateReversalRequest {
  transaction_id: string;
  reason: string;
}

export interface ReversalFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  initiated_by?: string;
  transaction_type?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

export class ReversalService {
  static async getReversalRequests(filters?: ReversalFilters): Promise<PaginatedResponse<ReversalRequest>> {
    return apiClient.get<PaginatedResponse<ReversalRequest>>('/reversals', filters);
  }

  static async createReversalRequest(reversalData: CreateReversalRequest): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>('/reversals', reversalData);
  }

  static async approveReversal(id: string): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>(`/reversals/${id}/approve`);
  }

  static async rejectReversal(id: string): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>(`/reversals/${id}/reject`);
  }
}