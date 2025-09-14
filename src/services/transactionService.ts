import { apiClient, PaginatedResponse } from './api';

export interface Transaction {
  id: string;
  tx_code: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer' | 'fee' | 'penalty';
  amount: number;
  fees: number;
  user_id: string;
  user_name: string;
  group_id?: string;
  group_name?: string;
  from_account: string;
  to_account: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  mpesa_receipt?: string;
  reference_number?: string;
  initiated_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTransactionRequest {
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
  amount: number;
  user_id: string;
  group_id?: string;
  description: string;
  mpesa_receipt?: string;
  reference_number?: string;
  scheduled_date?: string;
}

export interface UpdateTransactionRequest {
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  description?: string;
  mpesa_receipt?: string;
  reference_number?: string;
  admin_notes?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'inwallet' | 'outwallet' | 'withdrawals' | 'all';
  transaction_type?: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  user_id?: string;
  group_id?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  initiated_by?: string;
  mpesa_receipt?: string;
}

export interface TransactionStats {
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  average_transaction_amount: number;
  transactions_by_type: Record<string, number>;
  transactions_by_status: Record<string, number>;
  daily_volume: Record<string, number>;
}

export interface BulkTransactionRequest {
  transactions: CreateTransactionRequest[];
  batch_reference?: string;
  scheduled_date?: string;
}

export interface BulkTransactionResponse {
  successful: number;
  failed: number;
  batch_id: string;
  errors: Array<{ index: number; error: string; transaction_data: any }>;
  created_transactions: Transaction[];
}

export interface TransactionReconciliation {
  mpesa_receipt: string;
  expected_amount: number;
  actual_amount: number;
  status: 'matched' | 'unmatched' | 'disputed';
  discrepancy?: number;
}

export class TransactionService {
  // Enhanced transaction listing with advanced filtering
  static async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions', params);
  }

  // Specialized transaction endpoints
  static async getInwalletTransactions(filters?: Omit<TransactionFilters, 'type'>): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions/inwallet', {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    });
  }

  static async getOutwalletTransactions(filters?: Omit<TransactionFilters, 'type'>): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions/outwallet', {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    });
  }

  static async getWithdrawalTransactions(filters?: Omit<TransactionFilters, 'type'>): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions/withdrawals', {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    });
  }

  // Transaction CRUD operations
  static async getTransactionById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  }

  static async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>('/transactions', transactionData);
  }

  static async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction> {
    return apiClient.put<Transaction>(`/transactions/${id}`, updates);
  }

  static async cancelTransaction(id: string, reason: string): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${id}/cancel`, { reason });
  }

  static async deleteTransaction(id: string): Promise<void> {
    return apiClient.delete<void>(`/transactions/${id}`);
  }

  // Bulk operations
  static async bulkCreateTransactions(data: BulkTransactionRequest): Promise<BulkTransactionResponse> {
    return apiClient.post<BulkTransactionResponse>('/transactions/bulk', data);
  }

  static async bulkUpdateTransactions(updates: Array<{ id: string; data: UpdateTransactionRequest }>): Promise<Transaction[]> {
    return apiClient.put<Transaction[]>('/transactions/bulk', { updates });
  }

  // Transaction analytics
  static async getTransactionStats(filters?: {
    date_from?: string;
    date_to?: string;
    user_id?: string;
    group_id?: string;
    type?: string;
  }): Promise<TransactionStats> {
    return apiClient.get<TransactionStats>('/transactions/stats', filters);
  }

  static async getTransactionAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
    metric?: 'count' | 'amount' | 'fees';
  }): Promise<{
    timeline: Record<string, number>;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_user: Array<{ user_id: string; user_name: string; count: number; amount: number }>;
    by_group: Array<{ group_id: string; group_name: string; count: number; amount: number }>;
  }> {
    return apiClient.get<any>('/transactions/analytics', filters);
  }

  // Transaction verification and reconciliation
  static async verifyTransaction(id: string): Promise<{
    verified: boolean;
    mpesa_status?: string;
    discrepancies?: string[];
  }> {
    return apiClient.post<any>(`/transactions/${id}/verify`);
  }

  static async reconcileTransactions(data: {
    date_from: string;
    date_to: string;
    source: 'mpesa' | 'bank' | 'manual';
  }): Promise<{
    total_checked: number;
    matched: number;
    unmatched: number;
    discrepancies: TransactionReconciliation[];
  }> {
    return apiClient.post<any>('/transactions/reconcile', data);
  }

  // Transaction search and filtering
  static async searchTransactions(query: string, filters?: {
    limit?: number;
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>('/transactions/search', { q: query, ...filters });
  }

  // Transaction reports
  static async generateTransactionReport(filters: {
    date_from: string;
    date_to: string;
    format: 'pdf' | 'csv' | 'xlsx';
    group_by?: 'user' | 'group' | 'type' | 'status';
    include_details?: boolean;
  }): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/transactions/report`, {
      method: 'POST',
      headers: apiClient['getHeaders'](),
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to generate transaction report');
    }

    return response.blob();
  }

  // Transaction approval workflow
  static async approveTransaction(id: string, notes?: string): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${id}/approve`, { notes });
  }

  static async rejectTransaction(id: string, reason: string): Promise<Transaction> {
    return apiClient.post<Transaction>(`/transactions/${id}/reject`, { reason });
  }

  // Transaction notifications
  static async getTransactionNotifications(transactionId: string): Promise<Array<{
    id: string;
    type: 'sms' | 'email' | 'push';
    recipient: string;
    message: string;
    status: 'sent' | 'failed' | 'pending';
    sent_at?: string;
  }>> {
    return apiClient.get<any[]>(`/transactions/${transactionId}/notifications`);
  }

  static async resendTransactionNotification(transactionId: string, type: 'sms' | 'email'): Promise<{
    sent: boolean;
    message: string;
  }> {
    return apiClient.post<any>(`/transactions/${transactionId}/notifications/resend`, { type });
  }
}