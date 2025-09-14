import { apiClient, PaginatedResponse } from './api';

export interface Account {
  id: string;
  account_name: string;
  account_number: string;
  paybill_number: string;
  current_balance: number;
  available_balance: number;
  pending_balance: number;
  currency: string;
  account_type: 'main' | 'escrow' | 'reserve' | 'operational';
  status: 'active' | 'inactive' | 'frozen';
  last_updated: string;
  created_at: string;
}

export interface AccountTransaction {
  id: string;
  account_id: string;
  tx_code: string;
  mpesa_receipt: string;
  sender: string;
  sender_phone: string;
  amount: number;
  fees: number;
  balance_before: number;
  balance_after: number;
  transaction_type: 'credit' | 'debit';
  description?: string;
  reference_number?: string;
  status: 'success' | 'pending' | 'failed' | 'reversed';
  completed_at: string;
  created_at: string;
}

export interface AccountFilters {
  page?: number;
  limit?: number;
  account_type?: 'main' | 'escrow' | 'reserve' | 'operational';
  status?: 'success' | 'pending' | 'failed' | 'reversed';
  transaction_type?: 'credit' | 'debit';
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  sender?: string;
  mpesa_receipt?: string;
}

export interface AccountStats {
  total_transactions: number;
  total_credits: number;
  total_debits: number;
  total_fees: number;
  average_transaction_amount: number;
  daily_volume: number;
  monthly_volume: number;
  success_rate: number;
  peak_transaction_hour: string;
}

export interface AccountReconciliation {
  account_id: string;
  reconciliation_date: string;
  opening_balance: number;
  closing_balance: number;
  total_credits: number;
  total_debits: number;
  calculated_balance: number;
  actual_balance: number;
  variance: number;
  status: 'balanced' | 'unbalanced';
  discrepancies: Array<{
    transaction_id: string;
    expected_amount: number;
    actual_amount: number;
    difference: number;
  }>;
}

export interface BalanceAlert {
  id: string;
  account_id: string;
  alert_type: 'low_balance' | 'high_volume' | 'suspicious_activity' | 'reconciliation_error';
  threshold: number;
  current_value: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
}

export class AccountService {
  // Account management
  static async getAccounts(filters?: {
    account_type?: string;
    status?: string;
  }): Promise<Account[]> {
    return apiClient.get<Account[]>('/accounts', filters);
  }

  static async getAccountById(id: string): Promise<Account> {
    return apiClient.get<Account>(`/accounts/${id}`);
  }

  static async getMainAccount(): Promise<Account> {
    return apiClient.get<Account>('/accounts/main');
  }

  static async updateAccount(id: string, data: {
    account_name?: string;
    status?: 'active' | 'inactive' | 'frozen';
  }): Promise<Account> {
    return apiClient.put<Account>(`/accounts/${id}`, data);
  }

  // Balance management
  static async getAccountBalance(accountId?: string): Promise<{
    current_balance: number;
    available_balance: number;
    pending_balance: number;
    last_updated: string;
  }> {
    const endpoint = accountId ? `/accounts/${accountId}/balance` : '/accounts/balance';
    return apiClient.get<any>(endpoint);
  }

  static async getAllAccountBalances(): Promise<Array<{
    account_id: string;
    account_name: string;
    current_balance: number;
    available_balance: number;
    pending_balance: number;
  }>> {
    return apiClient.get<any[]>('/accounts/balances');
  }

  static async updateAccountBalance(accountId: string, data: {
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    reference?: string;
  }): Promise<Account> {
    return apiClient.post<Account>(`/accounts/${accountId}/balance`, data);
  }

  // Transaction management
  static async getAccountTransactions(accountId?: string, filters?: AccountFilters): Promise<PaginatedResponse<AccountTransaction>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    const endpoint = accountId ? `/accounts/${accountId}/transactions` : '/accounts/transactions';
    return apiClient.get<PaginatedResponse<AccountTransaction>>(endpoint, params);
  }

  static async getTransactionById(transactionId: string): Promise<AccountTransaction> {
    return apiClient.get<AccountTransaction>(`/accounts/transactions/${transactionId}`);
  }

  static async createAccountTransaction(data: {
    account_id?: string;
    amount: number;
    transaction_type: 'credit' | 'debit';
    description: string;
    mpesa_receipt?: string;
    sender?: string;
    sender_phone?: string;
    reference_number?: string;
  }): Promise<AccountTransaction> {
    return apiClient.post<AccountTransaction>('/accounts/transactions', data);
  }

  // Account analytics
  static async getAccountStats(accountId?: string, filters?: {
    date_from?: string;
    date_to?: string;
  }): Promise<AccountStats> {
    const endpoint = accountId ? `/accounts/${accountId}/stats` : '/accounts/stats';
    return apiClient.get<AccountStats>(endpoint, filters);
  }

  static async getAccountAnalytics(accountId?: string, filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<{
    transaction_timeline: Record<string, number>;
    balance_timeline: Record<string, number>;
    volume_by_hour: Record<string, number>;
    sender_analysis: Array<{
      sender: string;
      transaction_count: number;
      total_amount: number;
    }>;
    fee_analysis: {
      total_fees: number;
      average_fee: number;
      fee_timeline: Record<string, number>;
    };
  }> {
    const endpoint = accountId ? `/accounts/${accountId}/analytics` : '/accounts/analytics';
    return apiClient.get<any>(endpoint, filters);
  }

  // Account reconciliation
  static async reconcileAccount(accountId: string, data: {
    reconciliation_date: string;
    expected_balance: number;
    actual_balance: number;
    notes?: string;
  }): Promise<AccountReconciliation> {
    return apiClient.post<AccountReconciliation>(`/accounts/${accountId}/reconcile`, data);
  }

  static async getReconciliationHistory(accountId: string, filters?: {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
    status?: 'balanced' | 'unbalanced';
  }): Promise<PaginatedResponse<AccountReconciliation>> {
    return apiClient.get<PaginatedResponse<AccountReconciliation>>(`/accounts/${accountId}/reconciliations`, filters);
  }

  static async autoReconcileAccount(accountId: string, date: string): Promise<AccountReconciliation> {
    return apiClient.post<AccountReconciliation>(`/accounts/${accountId}/auto-reconcile`, { date });
  }

  // Balance alerts and monitoring
  static async getBalanceAlerts(filters?: {
    account_id?: string;
    alert_type?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'active' | 'acknowledged' | 'resolved';
  }): Promise<BalanceAlert[]> {
    return apiClient.get<BalanceAlert[]>('/accounts/alerts', filters);
  }

  static async acknowledgeAlert(alertId: string): Promise<BalanceAlert> {
    return apiClient.post<BalanceAlert>(`/accounts/alerts/${alertId}/acknowledge`);
  }

  static async resolveAlert(alertId: string, resolution_notes: string): Promise<BalanceAlert> {
    return apiClient.post<BalanceAlert>(`/accounts/alerts/${alertId}/resolve`, { resolution_notes });
  }

  static async createBalanceAlert(data: {
    account_id: string;
    alert_type: 'low_balance' | 'high_volume' | 'suspicious_activity';
    threshold: number;
    message: string;
  }): Promise<BalanceAlert> {
    return apiClient.post<BalanceAlert>('/accounts/alerts', data);
  }

  // Account reporting
  static async generateAccountStatement(accountId: string, data: {
    date_from: string;
    date_to: string;
    format: 'pdf' | 'csv' | 'xlsx';
    include_reconciliation?: boolean;
  }): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/accounts/${accountId}/statement`, {
      method: 'POST',
      headers: apiClient['getHeaders'](),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate account statement');
    }

    return response.blob();
  }

  // M-Pesa integration
  static async syncMpesaTransactions(data: {
    date_from: string;
    date_to: string;
    account_id?: string;
  }): Promise<{
    synced: number;
    new_transactions: number;
    updated_transactions: number;
    errors: string[];
  }> {
    return apiClient.post<any>('/accounts/sync-mpesa', data);
  }

  static async getMpesaTransactionStatus(mpesaReceipt: string): Promise<{
    receipt: string;
    amount: number;
    sender: string;
    status: string;
    transaction_date: string;
    matched_transaction_id?: string;
  }> {
    return apiClient.get<any>(`/accounts/mpesa-status/${mpesaReceipt}`);
  }

  // Account search
  static async searchAccountTransactions(query: string, filters?: {
    account_id?: string;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<AccountTransaction[]> {
    return apiClient.get<AccountTransaction[]>('/accounts/transactions/search', { q: query, ...filters });
  }

  // Account backup and restore
  static async backupAccountData(accountId: string, data: {
    include_transactions?: boolean;
    include_reconciliations?: boolean;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    backup_id: string;
    file_size: number;
    records_count: number;
    created_at: string;
  }> {
    return apiClient.post<any>(`/accounts/${accountId}/backup`, data);
  }

  static async getAccountBackups(accountId: string): Promise<Array<{
    backup_id: string;
    file_size: number;
    records_count: number;
    created_at: string;
    status: 'completed' | 'in_progress' | 'failed';
  }>> {
    return apiClient.get<any[]>(`/accounts/${accountId}/backups`);
  }

  static async downloadAccountBackup(backupId: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/accounts/backups/${backupId}/download`, {
      headers: apiClient['getHeaders'](),
    });

    if (!response.ok) {
      throw new Error('Failed to download backup');
    }

    return response.blob();
  }
}