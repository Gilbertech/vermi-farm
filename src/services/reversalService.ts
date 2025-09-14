import { apiClient, PaginatedResponse } from './api';

export interface ReversalRequest {
  id: string;
  tx_code: string;
  original_transaction_id: string;
  initiated_by: string;
  initiated_by_name: string;
  transaction_type: 'payment' | 'transfer' | 'loan' | 'withdrawal';
  amount: number;
  transaction_time: string;
  from_account: string;
  to_account: string;
  reason: string;
  supporting_documents?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  reversal_fee?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateReversalRequest {
  transaction_id: string;
  reason: string;
  supporting_documents?: string[];
  urgency_level?: 'low' | 'medium' | 'high' | 'critical';
  customer_complaint_id?: string;
}

export interface ReversalFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  initiated_by?: string;
  transaction_type?: 'payment' | 'transfer' | 'loan' | 'withdrawal';
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  urgency_level?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
}

export interface ReversalStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  completed_reversals: number;
  failed_reversals: number;
  total_amount_reversed: number;
  average_processing_time: number;
  approval_rate: number;
  reversal_by_type: Record<string, number>;
  reversal_by_reason: Record<string, number>;
}

export interface ReversalApprovalRequest {
  notes?: string;
  reversal_fee?: number;
  partial_reversal?: boolean;
  partial_amount?: number;
}

export interface ReversalRejectionRequest {
  reason: string;
  notes?: string;
  alternative_solution?: string;
}

export interface ReversalBatch {
  id: string;
  name: string;
  reversal_ids: string[];
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_by: string;
  created_at: string;
  processed_at?: string;
}

export class ReversalService {
  // Reversal request management
  static async getReversalRequests(filters?: ReversalFilters): Promise<PaginatedResponse<ReversalRequest>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<ReversalRequest>>('/reversals', params);
  }

  static async getReversalById(id: string): Promise<ReversalRequest> {
    return apiClient.get<ReversalRequest>(`/reversals/${id}`);
  }

  static async createReversalRequest(reversalData: CreateReversalRequest): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>('/reversals', reversalData);
  }

  static async updateReversalRequest(id: string, data: {
    reason?: string;
    urgency_level?: 'low' | 'medium' | 'high' | 'critical';
    supporting_documents?: string[];
  }): Promise<ReversalRequest> {
    return apiClient.put<ReversalRequest>(`/reversals/${id}`, data);
  }

  static async deleteReversalRequest(id: string): Promise<void> {
    return apiClient.delete<void>(`/reversals/${id}`);
  }

  // Reversal approval workflow
  static async approveReversal(id: string, data?: ReversalApprovalRequest): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>(`/reversals/${id}/approve`, data);
  }

  static async rejectReversal(id: string, data: ReversalRejectionRequest): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>(`/reversals/${id}/reject`, data);
  }

  static async processReversal(id: string): Promise<ReversalRequest> {
    return apiClient.post<ReversalRequest>(`/reversals/${id}/process`);
  }

  // Batch reversal operations
  static async createReversalBatch(data: {
    name: string;
    reversal_ids: string[];
    notes?: string;
  }): Promise<ReversalBatch> {
    return apiClient.post<ReversalBatch>('/reversals/batch', data);
  }

  static async getReversalBatches(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    created_by?: string;
  }): Promise<PaginatedResponse<ReversalBatch>> {
    return apiClient.get<PaginatedResponse<ReversalBatch>>('/reversals/batches', filters);
  }

  static async processReversalBatch(batchId: string): Promise<ReversalBatch> {
    return apiClient.post<ReversalBatch>(`/reversals/batches/${batchId}/process`);
  }

  // Reversal analytics and reporting
  static async getReversalStats(filters?: {
    date_from?: string;
    date_to?: string;
    transaction_type?: string;
    initiated_by?: string;
  }): Promise<ReversalStats> {
    return apiClient.get<ReversalStats>('/reversals/stats', filters);
  }

  static async getReversalAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    reversal_timeline: Record<string, number>;
    processing_time_analysis: {
      average_time: number;
      median_time: number;
      time_by_type: Record<string, number>;
    };
    reason_analysis: Record<string, number>;
    success_rate_timeline: Record<string, number>;
  }> {
    return apiClient.get<any>('/reversals/analytics', filters);
  }

  // Reversal search and filtering
  static async searchReversals(query: string, filters?: {
    limit?: number;
    status?: string;
    transaction_type?: string;
  }): Promise<ReversalRequest[]> {
    return apiClient.get<ReversalRequest[]>('/reversals/search', { q: query, ...filters });
  }

  // Reversal notifications
  static async getReversalNotifications(reversalId: string): Promise<Array<{
    id: string;
    type: 'sms' | 'email' | 'push';
    recipient: string;
    message: string;
    status: 'sent' | 'failed' | 'pending';
    sent_at?: string;
  }>> {
    return apiClient.get<any[]>(`/reversals/${reversalId}/notifications`);
  }

  static async sendReversalNotification(reversalId: string, data: {
    type: 'sms' | 'email' | 'both';
    message?: string;
    recipients?: string[];
  }): Promise<{
    sent: number;
    failed: number;
    results: Array<{ recipient: string; status: string; message?: string }>;
  }> {
    return apiClient.post<any>(`/reversals/${reversalId}/notify`, data);
  }

  // Reversal audit trail
  static async getReversalAuditTrail(reversalId: string): Promise<Array<{
    id: string;
    action: string;
    description: string;
    user_id: string;
    user_name: string;
    old_status?: string;
    new_status?: string;
    notes?: string;
    ip_address: string;
    created_at: string;
  }>> {
    return apiClient.get<any[]>(`/reversals/${reversalId}/audit`);
  }

  // Reversal reporting
  static async generateReversalReport(data: {
    date_from: string;
    date_to: string;
    format: 'pdf' | 'csv' | 'xlsx';
    include_details?: boolean;
    status?: string;
    transaction_type?: string;
  }): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/reversals/report`, {
      method: 'POST',
      headers: apiClient['getHeaders'](),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate reversal report');
    }

    return response.blob();
  }

  // Reversal validation
  static async validateReversalEligibility(transactionId: string): Promise<{
    eligible: boolean;
    reasons?: string[];
    time_limit_hours?: number;
    reversal_fee?: number;
    warnings?: string[];
  }> {
    return apiClient.get<any>(`/reversals/validate/${transactionId}`);
  }

  // Automatic reversal detection
  static async detectSuspiciousTransactions(filters?: {
    date_from?: string;
    date_to?: string;
    amount_threshold?: number;
    pattern_type?: 'duplicate' | 'unusual_amount' | 'rapid_succession';
  }): Promise<Array<{
    transaction_id: string;
    suspicion_score: number;
    reasons: string[];
    recommended_action: 'review' | 'auto_reverse' | 'flag';
  }>> {
    return apiClient.get<any[]>('/reversals/detect-suspicious', filters);
  }

  // Reversal policies and limits
  static async getReversalPolicies(): Promise<{
    time_limit_hours: number;
    daily_reversal_limit: number;
    monthly_reversal_limit: number;
    max_reversal_amount: number;
    auto_approval_threshold: number;
    reversal_fee_percentage: number;
  }> {
    return apiClient.get<any>('/reversals/policies');
  }

  static async updateReversalPolicies(policies: {
    time_limit_hours?: number;
    daily_reversal_limit?: number;
    monthly_reversal_limit?: number;
    max_reversal_amount?: number;
    auto_approval_threshold?: number;
    reversal_fee_percentage?: number;
  }): Promise<any> {
    return apiClient.put<any>('/reversals/policies', policies);
  }
}