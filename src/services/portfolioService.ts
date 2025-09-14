import { apiClient, PaginatedResponse } from './api';

export interface PortfolioTransaction {
  id: string;
  tx_code: string;
  portfolio_type: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
  from_account: string;
  to_account: string;
  amount: number;
  fees: number;
  description?: string;
  reference_number?: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  initiated_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface PortfolioTransferRequest {
  from_portfolio: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
  to_portfolio: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
  amount: number;
  description: string;
  reference?: string;
  scheduled_date?: string;
  approval_required?: boolean;
}

export interface PortfolioBalance {
  portfolio_type: string;
  current_balance: number;
  available_balance: number;
  pending_in: number;
  pending_out: number;
  last_updated: string;
}

export interface PortfolioStats {
  total_balance: number;
  total_transactions: number;
  total_fees: number;
  monthly_growth: number;
  weekly_transactions: number;
  average_transaction_amount: number;
  largest_transaction: number;
  transaction_velocity: number;
}

export interface PortfolioFilters {
  page?: number;
  limit?: number;
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  initiated_by?: string;
  reference_number?: string;
}

export interface PortfolioAllocation {
  portfolio_type: string;
  target_percentage: number;
  current_percentage: number;
  target_amount: number;
  current_amount: number;
  variance: number;
  status: 'on_target' | 'over_allocated' | 'under_allocated';
}

export interface PortfolioRebalanceRequest {
  allocations: Array<{
    portfolio_type: string;
    target_percentage: number;
  }>;
  rebalance_method: 'proportional' | 'priority_based';
  max_transfer_amount?: number;
  reason: string;
}

export class PortfolioService {
  // Portfolio transaction management
  static async getPortfolioTransactions(
    portfolioType: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings',
    filters?: PortfolioFilters
  ): Promise<PaginatedResponse<PortfolioTransaction>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<PortfolioTransaction>>(`/portfolios/${portfolioType}/transactions`, params);
  }

  static async getAllPortfolioTransactions(filters?: PortfolioFilters): Promise<PaginatedResponse<PortfolioTransaction>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<PortfolioTransaction>>('/portfolios/transactions', params);
  }

  // Portfolio transfers
  static async transferBetweenPortfolios(transferData: PortfolioTransferRequest): Promise<PortfolioTransaction> {
    return apiClient.post<PortfolioTransaction>('/portfolios/transfer', transferData);
  }

  static async approveTransfer(transferId: string, notes?: string): Promise<PortfolioTransaction> {
    return apiClient.post<PortfolioTransaction>(`/portfolios/transfers/${transferId}/approve`, { notes });
  }

  static async rejectTransfer(transferId: string, reason: string): Promise<PortfolioTransaction> {
    return apiClient.post<PortfolioTransaction>(`/portfolios/transfers/${transferId}/reject`, { reason });
  }

  static async getPendingTransfers(filters?: {
    page?: number;
    limit?: number;
    from_portfolio?: string;
    to_portfolio?: string;
    initiated_by?: string;
  }): Promise<PaginatedResponse<PortfolioTransaction>> {
    return apiClient.get<PaginatedResponse<PortfolioTransaction>>('/portfolios/transfers/pending', filters);
  }

  // Portfolio balances and stats
  static async getPortfolioBalance(
    portfolioType: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings'
  ): Promise<PortfolioBalance> {
    return apiClient.get<PortfolioBalance>(`/portfolios/${portfolioType}/balance`);
  }

  static async getAllPortfolioBalances(): Promise<PortfolioBalance[]> {
    return apiClient.get<PortfolioBalance[]>('/portfolios/balances');
  }

  static async getPortfolioStats(
    portfolioType: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings',
    filters?: {
      date_from?: string;
      date_to?: string;
    }
  ): Promise<PortfolioStats> {
    return apiClient.get<PortfolioStats>(`/portfolios/${portfolioType}/stats`, filters);
  }

  // Portfolio analytics
  static async getPortfolioAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    balance_timeline: Record<string, Record<string, number>>;
    transfer_flow: Array<{
      from_portfolio: string;
      to_portfolio: string;
      total_amount: number;
      transaction_count: number;
    }>;
    performance_metrics: Record<string, {
      roi: number;
      growth_rate: number;
      volatility: number;
    }>;
  }> {
    return apiClient.get<any>('/portfolios/analytics', filters);
  }

  // Portfolio allocation and rebalancing
  static async getPortfolioAllocations(): Promise<PortfolioAllocation[]> {
    return apiClient.get<PortfolioAllocation[]>('/portfolios/allocations');
  }

  static async updatePortfolioAllocations(allocations: Array<{
    portfolio_type: string;
    target_percentage: number;
  }>): Promise<PortfolioAllocation[]> {
    return apiClient.put<PortfolioAllocation[]>('/portfolios/allocations', { allocations });
  }

  static async rebalancePortfolios(data: PortfolioRebalanceRequest): Promise<{
    rebalance_id: string;
    transfers_created: number;
    total_amount_moved: number;
    new_allocations: PortfolioAllocation[];
  }> {
    return apiClient.post<any>('/portfolios/rebalance', data);
  }

  // Portfolio limits and controls
  static async getPortfolioLimits(): Promise<Record<string, {
    min_balance: number;
    max_balance: number;
    daily_transfer_limit: number;
    monthly_transfer_limit: number;
  }>> {
    return apiClient.get<any>('/portfolios/limits');
  }

  static async updatePortfolioLimits(portfolioType: string, limits: {
    min_balance?: number;
    max_balance?: number;
    daily_transfer_limit?: number;
    monthly_transfer_limit?: number;
  }): Promise<any> {
    return apiClient.put<any>(`/portfolios/${portfolioType}/limits`, limits);
  }

  // Portfolio reporting
  static async generatePortfolioReport(data: {
    portfolio_types: string[];
    date_from: string;
    date_to: string;
    format: 'pdf' | 'csv' | 'xlsx';
    include_transactions?: boolean;
    include_analytics?: boolean;
  }): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/portfolios/report`, {
      method: 'POST',
      headers: apiClient['getHeaders'](),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate portfolio report');
    }

    return response.blob();
  }

  // Portfolio search
  static async searchPortfolioTransactions(query: string, filters?: {
    portfolio_type?: string;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<PortfolioTransaction[]> {
    return apiClient.get<PortfolioTransaction[]>('/portfolios/search', { q: query, ...filters });
  }

  // Portfolio audit trail
  static async getPortfolioAuditTrail(portfolioType: string, filters?: {
    page?: number;
    limit?: number;
    action_type?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<{
    id: string;
    action: string;
    description: string;
    old_value?: any;
    new_value?: any;
    user_id: string;
    user_name: string;
    ip_address: string;
    created_at: string;
  }>> {
    return apiClient.get<PaginatedResponse<any>>(`/portfolios/${portfolioType}/audit`, filters);
  }

  // Portfolio performance tracking
  static async getPortfolioPerformance(portfolioType: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{
    current_balance: number;
    period_start_balance: number;
    period_end_balance: number;
    net_change: number;
    percentage_change: number;
    inflows: number;
    outflows: number;
    fees_earned: number;
    performance_score: number;
  }> {
    return apiClient.get<any>(`/portfolios/${portfolioType}/performance`, { period });
  }
}