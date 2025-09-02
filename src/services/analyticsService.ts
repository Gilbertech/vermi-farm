import { apiClient } from './api';

export interface DashboardAnalytics {
  total_users: number;
  total_groups: number;
  completed_transactions: number;
  total_transacted: number;
  total_loan_disbursed: number;
  total_loan_repaid: number;
  total_earned: number;
  new_users_today: number;
  failed_transactions: number;
  growth_metrics: {
    users_growth: number;
    groups_growth: number;
    transactions_growth: number;
    revenue_growth: number;
  };
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_registrations: {
    today: number;
    week: number;
    month: number;
  };
  user_distribution: {
    by_role: Record<string, number>;
    by_group: Record<string, number>;
    by_status: Record<string, number>;
  };
}

export interface TransactionAnalytics {
  total_transactions: number;
  total_amount: number;
  transaction_distribution: {
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_month: Record<string, number>;
  };
  average_transaction_amount: number;
  peak_transaction_hours: Record<string, number>;
}

export interface LoanAnalytics {
  total_loans: number;
  total_disbursed: number;
  total_repaid: number;
  active_loans: number;
  overdue_loans: number;
  average_loan_amount: number;
  repayment_rate: number;
  loan_distribution: {
    by_type: Record<string, number>;
    by_group: Record<string, number>;
    by_status: Record<string, number>;
  };
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_sources: {
    interest_income: number;
    service_fees: number;
    penalties: number;
    other: number;
  };
  monthly_revenue: Record<string, number>;
  revenue_growth: number;
  profit_margin: number;
}

export class AnalyticsService {
  static async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard');
  }

  static async getUserAnalytics(filters?: { date_from?: string; date_to?: string }): Promise<UserAnalytics> {
    return apiClient.get<UserAnalytics>('/analytics/users', filters);
  }

  static async getTransactionAnalytics(filters?: { date_from?: string; date_to?: string }): Promise<TransactionAnalytics> {
    return apiClient.get<TransactionAnalytics>('/analytics/transactions', filters);
  }

  static async getLoanAnalytics(filters?: { date_from?: string; date_to?: string }): Promise<LoanAnalytics> {
    return apiClient.get<LoanAnalytics>('/analytics/loans', filters);
  }

  static async getRevenueAnalytics(filters?: { date_from?: string; date_to?: string }): Promise<RevenueAnalytics> {
    return apiClient.get<RevenueAnalytics>('/analytics/revenue', filters);
  }
}