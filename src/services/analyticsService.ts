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
  active_loans: number;
  overdue_loans: number;
  growth_metrics: {
    users_growth: number;
    groups_growth: number;
    transactions_growth: number;
    revenue_growth: number;
    loans_growth: number;
  };
  system_health: {
    api_response_time: number;
    database_status: 'healthy' | 'degraded' | 'down';
    mpesa_status: 'connected' | 'disconnected' | 'error';
    sms_status: 'active' | 'inactive' | 'error';
    last_backup: string;
  };
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  new_registrations: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  user_distribution: {
    by_role: Record<string, number>;
    by_group: Record<string, number>;
    by_status: Record<string, number>;
    by_location: Record<string, number>;
  };
  user_activity: {
    daily_active_users: Record<string, number>;
    login_frequency: Record<string, number>;
    feature_usage: Record<string, number>;
  };
  user_retention: {
    day_1: number;
    day_7: number;
    day_30: number;
    day_90: number;
  };
}

export interface TransactionAnalytics {
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  transaction_distribution: {
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_month: Record<string, number>;
    by_day_of_week: Record<string, number>;
    by_hour: Record<string, number>;
  };
  average_transaction_amount: number;
  median_transaction_amount: number;
  peak_transaction_hours: Record<string, number>;
  transaction_velocity: {
    transactions_per_hour: number;
    transactions_per_day: number;
    volume_per_hour: number;
    volume_per_day: number;
  };
  geographic_distribution: Record<string, {
    transaction_count: number;
    total_amount: number;
  }>;
}

export interface LoanAnalytics {
  total_loans: number;
  total_disbursed: number;
  total_repaid: number;
  outstanding_balance: number;
  active_loans: number;
  overdue_loans: number;
  completed_loans: number;
  defaulted_loans: number;
  average_loan_amount: number;
  median_loan_amount: number;
  repayment_rate: number;
  default_rate: number;
  portfolio_at_risk: number;
  loan_distribution: {
    by_type: Record<string, number>;
    by_group: Record<string, number>;
    by_status: Record<string, number>;
    by_amount_range: Record<string, number>;
  };
  repayment_analysis: {
    on_time_payments: number;
    late_payments: number;
    average_days_late: number;
    early_payments: number;
  };
  risk_analysis: {
    low_risk_loans: number;
    medium_risk_loans: number;
    high_risk_loans: number;
    risk_factors: Record<string, number>;
  };
}

export interface RevenueAnalytics {
  total_revenue: number;
  net_revenue: number;
  gross_revenue: number;
  revenue_sources: {
    interest_income: number;
    service_fees: number;
    penalties: number;
    investment_returns: number;
    other: number;
  };
  monthly_revenue: Record<string, number>;
  quarterly_revenue: Record<string, number>;
  revenue_growth: {
    month_over_month: number;
    quarter_over_quarter: number;
    year_over_year: number;
  };
  profit_margin: number;
  cost_breakdown: {
    operational_costs: number;
    technology_costs: number;
    compliance_costs: number;
    marketing_costs: number;
    other_costs: number;
  };
  revenue_per_user: number;
  revenue_per_group: number;
}

export interface PaymentAnalytics {
  total_payments: number;
  total_amount: number;
  total_fees: number;
  successful_payments: number;
  failed_payments: number;
  success_rate: number;
  payment_distribution: {
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_amount_range: Record<string, number>;
  };
  cost_analysis: {
    total_transaction_costs: number;
    average_cost_per_payment: number;
    cost_by_payment_type: Record<string, number>;
  };
  processing_times: {
    average_processing_time: number;
    median_processing_time: number;
    processing_time_by_type: Record<string, number>;
  };
}

export interface SystemAnalytics {
  system_performance: {
    api_response_times: Record<string, number>;
    database_query_times: Record<string, number>;
    error_rates: Record<string, number>;
    uptime_percentage: number;
  };
  resource_usage: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_usage: number;
  };
  security_metrics: {
    failed_login_attempts: number;
    suspicious_activities: number;
    blocked_ips: number;
    security_alerts: number;
  };
  integration_status: {
    mpesa_api: 'healthy' | 'degraded' | 'down';
    sms_service: 'healthy' | 'degraded' | 'down';
    email_service: 'healthy' | 'degraded' | 'down';
    backup_service: 'healthy' | 'degraded' | 'down';
  };
}

export class AnalyticsService {
  // Dashboard analytics
  static async getDashboardAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    refresh_cache?: boolean;
  }): Promise<DashboardAnalytics> {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard', filters);
  }

  // User analytics
  static async getUserAnalytics(filters?: { 
    date_from?: string; 
    date_to?: string;
    group_id?: string;
    role?: string;
  }): Promise<UserAnalytics> {
    return apiClient.get<UserAnalytics>('/analytics/users', filters);
  }

  // Transaction analytics
  static async getTransactionAnalytics(filters?: { 
    date_from?: string; 
    date_to?: string;
    transaction_type?: string;
    user_id?: string;
    group_id?: string;
  }): Promise<TransactionAnalytics> {
    return apiClient.get<TransactionAnalytics>('/analytics/transactions', filters);
  }

  // Loan analytics
  static async getLoanAnalytics(filters?: { 
    date_from?: string; 
    date_to?: string;
    loan_type?: string;
    group_id?: string;
    status?: string;
  }): Promise<LoanAnalytics> {
    return apiClient.get<LoanAnalytics>('/analytics/loans', filters);
  }

  // Revenue analytics
  static async getRevenueAnalytics(filters?: { 
    date_from?: string; 
    date_to?: string;
    revenue_source?: string;
    group_id?: string;
  }): Promise<RevenueAnalytics> {
    return apiClient.get<RevenueAnalytics>('/analytics/revenue', filters);
  }

  // Payment analytics
  static async getPaymentAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    payment_type?: string;
    initiator_id?: string;
  }): Promise<PaymentAnalytics> {
    return apiClient.get<PaymentAnalytics>('/analytics/payments', filters);
  }

  // System analytics
  static async getSystemAnalytics(): Promise<SystemAnalytics> {
    return apiClient.get<SystemAnalytics>('/analytics/system');
  }

  // Custom analytics queries
  static async getCustomAnalytics(query: {
    metrics: string[];
    dimensions: string[];
    filters: Record<string, any>;
    date_from: string;
    date_to: string;
    group_by?: string;
  }): Promise<{
    data: Record<string, any>[];
    summary: Record<string, number>;
    metadata: {
      total_records: number;
      query_time: number;
      cache_hit: boolean;
    };
  }> {
    return apiClient.post<any>('/analytics/custom', query);
  }

  // Real-time analytics
  static async getRealTimeMetrics(): Promise<{
    active_users: number;
    transactions_last_hour: number;
    revenue_today: number;
    system_load: number;
    api_calls_per_minute: number;
    error_rate: number;
  }> {
    return apiClient.get<any>('/analytics/realtime');
  }

  // Comparative analytics
  static async getComparativeAnalytics(data: {
    metric: string;
    current_period: { from: string; to: string };
    comparison_period: { from: string; to: string };
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    current_period: Record<string, number>;
    comparison_period: Record<string, number>;
    growth_rate: number;
    trend: 'up' | 'down' | 'stable';
    insights: string[];
  }> {
    return apiClient.post<any>('/analytics/compare', data);
  }

  // Predictive analytics
  static async getPredictiveAnalytics(data: {
    metric: string;
    historical_data_months: number;
    prediction_months: number;
    confidence_level?: number;
  }): Promise<{
    predictions: Record<string, number>;
    confidence_intervals: Record<string, { lower: number; upper: number }>;
    model_accuracy: number;
    factors: Array<{ factor: string; importance: number }>;
  }> {
    return apiClient.post<any>('/analytics/predict', data);
  }

  // Export analytics
  static async exportAnalytics(data: {
    analytics_type: 'dashboard' | 'users' | 'transactions' | 'loans' | 'revenue' | 'payments';
    date_from: string;
    date_to: string;
    format: 'pdf' | 'csv' | 'xlsx';
    include_charts?: boolean;
    filters?: Record<string, any>;
  }): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/analytics/export`, {
      method: 'POST',
      headers: apiClient['getHeaders'](),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to export analytics');
    }

    return response.blob();
  }

  // Analytics subscriptions (for scheduled reports)
  static async createAnalyticsSubscription(data: {
    name: string;
    analytics_type: string;
    schedule: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'csv' | 'xlsx';
    filters?: Record<string, any>;
  }): Promise<{
    subscription_id: string;
    next_run: string;
    status: 'active';
  }> {
    return apiClient.post<any>('/analytics/subscriptions', data);
  }

  static async getAnalyticsSubscriptions(): Promise<Array<{
    id: string;
    name: string;
    analytics_type: string;
    schedule: string;
    recipients: string[];
    status: 'active' | 'paused' | 'cancelled';
    last_run?: string;
    next_run: string;
    created_at: string;
  }>> {
    return apiClient.get<any[]>('/analytics/subscriptions');
  }

  static async updateAnalyticsSubscription(id: string, data: {
    name?: string;
    schedule?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
    status?: 'active' | 'paused' | 'cancelled';
    filters?: Record<string, any>;
  }): Promise<any> {
    return apiClient.put<any>(`/analytics/subscriptions/${id}`, data);
  }

  static async deleteAnalyticsSubscription(id: string): Promise<void> {
    return apiClient.delete<void>(`/analytics/subscriptions/${id}`);
  }
}