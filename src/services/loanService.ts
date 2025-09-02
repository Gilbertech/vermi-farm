import { apiClient, PaginatedResponse } from './api';

export interface Loan {
  id: string;
  user_id: string;
  group_id: string;
  amount: number;
  repaid_amount: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'completed' | 'overdue';
  type: 'group' | 'individual';
  purpose: string;
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
}

export interface UpdateLoanRequest {
  amount?: number;
  interest_rate?: number;
  due_date?: string;
  status?: 'active' | 'completed' | 'overdue';
  purpose?: string;
}

export interface LoanRepaymentRequest {
  amount: number;
  payment_method: 'mpesa' | 'cash' | 'bank';
  mpesa_receipt?: string;
}

export interface LoanFilters {
  page?: number;
  limit?: number;
  type?: 'group' | 'individual';
  status?: 'active' | 'completed' | 'overdue';
  user_id?: string;
  group_id?: string;
  amount_min?: number;
  amount_max?: number;
  due_date_from?: string;
  due_date_to?: string;
}

export class LoanService {
  static async getLoans(filters?: LoanFilters): Promise<PaginatedResponse<Loan>> {
    return apiClient.get<PaginatedResponse<Loan>>('/loans', filters);
  }

  static async getLoanById(id: string): Promise<Loan> {
    return apiClient.get<Loan>(`/loans/${id}`);
  }

  static async createLoan(loanData: CreateLoanRequest): Promise<Loan> {
    return apiClient.post<Loan>('/loans', loanData);
  }

  static async updateLoan(id: string, updates: UpdateLoanRequest): Promise<Loan> {
    return apiClient.put<Loan>(`/loans/${id}`, updates);
  }

  static async recordRepayment(id: string, repaymentData: LoanRepaymentRequest): Promise<Loan> {
    return apiClient.post<Loan>(`/loans/${id}/repayment`, repaymentData);
  }
}