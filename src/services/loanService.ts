import { apiClient, PaginatedResponse } from './api';

export interface Loan {
  id: string;
  loan_number: string;
  user_id: string;
  user_name: string;
  group_id: string;
  group_name: string;
  amount: number;
  repaid_amount: number;
  interest_rate: number;
  interest_amount: number;
  total_amount: number;
  due_date: string;
  status: 'active' | 'completed' | 'overdue' | 'defaulted' | 'restructured';
  type: 'group' | 'individual';
  purpose: string;
  collateral?: string;
  guarantors?: string[];
  disbursed_by?: string;
  disbursed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLoanRequest {
  user_id: string;
  group_id: string;
  amount: number;
  interest_rate: number;
  due_date: string;
  type: 'group' | 'individual';
  purpose: string;
  collateral?: string;
  guarantors?: string[];
  repayment_schedule?: 'weekly' | 'monthly' | 'quarterly' | 'lump_sum';
}

export interface UpdateLoanRequest {
  amount?: number;
  interest_rate?: number;
  due_date?: string;
  status?: 'active' | 'completed' | 'overdue' | 'defaulted' | 'restructured';
  purpose?: string;
  collateral?: string;
  guarantors?: string[];
}

export interface LoanRepaymentRequest {
  amount: number;
  payment_method: 'mpesa' | 'cash' | 'bank' | 'offset';
  mpesa_receipt?: string;
  bank_reference?: string;
  notes?: string;
}

export interface LoanFilters {
  page?: number;
  limit?: number;
  type?: 'group' | 'individual';
  status?: 'active' | 'completed' | 'overdue' | 'defaulted' | 'restructured';
  user_id?: string;
  group_id?: string;
  amount_min?: number;
  amount_max?: number;
  due_date_from?: string;
  due_date_to?: string;
  disbursed_from?: string;
  disbursed_to?: string;
  search?: string;
  overdue_days?: number;
}

export interface LoanStats {
  total_loans: number;
  total_disbursed: number;
  total_repaid: number;
  outstanding_balance: number;
  active_loans: number;
  overdue_loans: number;
  completed_loans: number;
  default_rate: number;
  average_loan_amount: number;
  average_repayment_period: number;
  portfolio_at_risk: number;
}

export interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  penalty_amount?: number;
  payment_method: string;
  mpesa_receipt?: string;
  bank_reference?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface LoanSchedule {
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_date?: string;
  paid_amount?: number;
}

export interface LoanRestructureRequest {
  new_amount?: number;
  new_interest_rate?: number;
  new_due_date?: string;
  reason: string;
  terms_and_conditions?: string;
}

export class LoanService {
  // Enhanced loan listing with comprehensive filtering
  static async getLoans(filters?: LoanFilters): Promise<PaginatedResponse<Loan>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<Loan>>('/loans', params);
  }

  // Specialized loan queries
  static async getActiveLoans(filters?: Omit<LoanFilters, 'status'>): Promise<PaginatedResponse<Loan>> {
    return this.getLoans({ ...filters, status: 'active' });
  }

  static async getOverdueLoans(filters?: Omit<LoanFilters, 'status'>): Promise<PaginatedResponse<Loan>> {
    return this.getLoans({ ...filters, status: 'overdue' });
  }

  static async getCompletedLoans(filters?: Omit<LoanFilters, 'status'>): Promise<PaginatedResponse<Loan>> {
    return this.getLoans({ ...filters, status: 'completed' });
  }

  // Loan CRUD operations
  static async getLoanById(id: string): Promise<Loan> {
    return apiClient.get<Loan>(`/loans/${id}`);
  }

  static async createLoan(loanData: CreateLoanRequest): Promise<Loan> {
    return apiClient.post<Loan>('/loans', loanData);
  }

  static async updateLoan(id: string, updates: UpdateLoanRequest): Promise<Loan> {
    return apiClient.put<Loan>(`/loans/${id}`, updates);
  }

  static async deleteLoan(id: string): Promise<void> {
    return apiClient.delete<void>(`/loans/${id}`);
  }

  // Loan disbursement
  static async disburseLoan(id: string, data?: {
    disbursement_method?: 'mpesa' | 'bank' | 'cash';
    mpesa_phone?: string;
    bank_account?: string;
    notes?: string;
  }): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/disburse`, data);
  }

  static async approveLoanDisbursement(id: string, notes?: string): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/approve`, { notes });
  }

  static async rejectLoanDisbursement(id: string, reason: string): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/reject`, { reason });
  }

  // Repayment management
  static async recordRepayment(id: string, repaymentData: LoanRepaymentRequest): Promise<LoanRepayment> {
    return apiClient.post<LoanRepayment>(`/loans/${id}/repayment`, repaymentData);
  }

  static async getRepaymentHistory(id: string, filters?: {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<LoanRepayment>> {
    return apiClient.get<PaginatedResponse<LoanRepayment>>(`/loans/${id}/repayments`, filters);
  }

  static async getRepaymentSchedule(id: string): Promise<LoanSchedule[]> {
    return apiClient.get<LoanSchedule[]>(`/loans/${id}/schedule`);
  }

  static async updateRepaymentSchedule(id: string, schedule: LoanSchedule[]): Promise<LoanSchedule[]> {
    return apiClient.put<LoanSchedule[]>(`/loans/${id}/schedule`, { schedule });
  }

  // Loan restructuring
  static async restructureLoan(id: string, data: LoanRestructureRequest): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/restructure`, data);
  }

  static async approveRestructure(id: string, notes?: string): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/restructure/approve`, { notes });
  }

  static async rejectRestructure(id: string, reason: string): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/restructure/reject`, { reason });
  }

  // Loan analytics and reporting
  static async getLoanStats(filters?: {
    date_from?: string;
    date_to?: string;
    group_id?: string;
    type?: 'group' | 'individual';
  }): Promise<LoanStats> {
    return apiClient.get<LoanStats>('/loans/stats', filters);
  }

  static async getLoanAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    disbursement_timeline: Record<string, number>;
    repayment_timeline: Record<string, number>;
    loan_performance: {
      on_time_payments: number;
      late_payments: number;
      default_rate: number;
    };
    risk_analysis: {
      low_risk: number;
      medium_risk: number;
      high_risk: number;
    };
  }> {
    return apiClient.get<any>('/loans/analytics', filters);
  }

  // Loan portfolio management
  static async getPortfolioAtRisk(days: number = 30): Promise<{
    total_at_risk: number;
    amount_at_risk: number;
    loans_at_risk: Loan[];
    risk_percentage: number;
  }> {
    return apiClient.get<any>(`/loans/portfolio-at-risk`, { days });
  }

  static async getLoanAging(): Promise<{
    current: number;
    days_1_30: number;
    days_31_60: number;
    days_61_90: number;
    days_90_plus: number;
  }> {
    return apiClient.get<any>('/loans/aging');
  }

  // Loan notifications and reminders
  static async sendRepaymentReminder(id: string, type: 'sms' | 'email' | 'both'): Promise<{
    sent: boolean;
    message: string;
  }> {
    return apiClient.post<any>(`/loans/${id}/remind`, { type });
  }

  static async sendBulkReminders(filters: {
    days_before_due?: number;
    overdue_days?: number;
    group_id?: string;
    type?: 'sms' | 'email' | 'both';
  }): Promise<{
    sent: number;
    failed: number;
    results: Array<{ loan_id: string; status: string; message?: string }>;
  }> {
    return apiClient.post<any>('/loans/bulk-remind', filters);
  }

  // Loan search
  static async searchLoans(query: string, filters?: {
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<Loan[]> {
    return apiClient.get<Loan[]>('/loans/search', { q: query, ...filters });
  }

  // Export/Import
  static async exportLoans(filters?: LoanFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = { ...filters, format };
    const response = await fetch(`${apiClient['baseURL']}/loans/export?${new URLSearchParams(params).toString()}`, {
      headers: apiClient['getHeaders'](),
    });

    if (!response.ok) {
      throw new Error('Failed to export loans');
    }

    return response.blob();
  }

  // Loan validation
  static async validateLoanEligibility(userId: string, amount: number): Promise<{
    eligible: boolean;
    max_amount: number;
    reasons?: string[];
    credit_score?: number;
  }> {
    return apiClient.post<any>('/loans/validate-eligibility', { user_id: userId, amount });
  }

  // Interest calculations
  static async calculateInterest(loanId: string, asOfDate?: string): Promise<{
    principal_balance: number;
    interest_accrued: number;
    penalty_amount: number;
    total_due: number;
    days_overdue: number;
  }> {
    return apiClient.get<any>(`/loans/${loanId}/calculate-interest`, { as_of_date: asOfDate });
  }
}