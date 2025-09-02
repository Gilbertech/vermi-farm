import { apiClient, PaginatedResponse } from './api';

export interface Transaction {
  id: string;
  tx_code: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
  amount: number;
  fees: number;
  user_id: string;
  group_id?: string;
  from_account: string;
  to_account: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  mpesa_receipt?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
  amount: number;
  user_id: string;
  group_id?: string;
  description: string;
  mpesa_receipt?: string;
}

export interface UpdateTransactionRequest {
  status?: 'completed' | 'pending' | 'failed';
  description?: string;
  mpesa_receipt?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'inwallet' | 'outwallet' | 'withdrawals';
  status?: 'completed' | 'pending' | 'failed';
  user_id?: string;
  group_id?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

export class TransactionService {
  static async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions', filters);
  }

  static async getTransactionById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  }

  static async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>('/transactions', transactionData);
  }

  static async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction> {
    return apiClient.put<Transaction>(`/transactions/${id}`, updates);
  }

  static async getInwalletTransactions(filters?: Omit<TransactionFilters, 'type'>): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions/inwallet', filters);
  }

  static async getOutwalletTransactions(filters?: Omit<TransactionFilters, 'type'>): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions/outwallet', filters);
  }

  static async getWithdrawalTransactions(filters?: Omit<TransactionFilters, 'type'>): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>('/transactions/withdrawals', filters);
  }
}