import { apiClient, PaginatedResponse } from './api';

export interface Account {
  id: string;
  account_name: string;
  paybill_number: string;
  current_balance: number;
  last_updated: string;
}

export interface AccountTransaction {
  id: string;
  mpesa_receipt: string;
  sender: string;
  amount: number;
  completed_at: string;
  status: 'success' | 'pending' | 'failed';
}

export interface AccountFilters {
  page?: number;
  limit?: number;
  status?: 'success' | 'pending' | 'failed';
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

export class AccountService {
  static async getAccounts(): Promise<Account[]> {
    return apiClient.get<Account[]>('/accounts');
  }

  static async getAccountBalance(): Promise<{ current_balance: number; last_updated: string }> {
    return apiClient.get<{ current_balance: number; last_updated: string }>('/accounts/balance');
  }

  static async getAccountTransactions(filters?: AccountFilters): Promise<PaginatedResponse<AccountTransaction>> {
    return apiClient.get<PaginatedResponse<AccountTransaction>>('/accounts/transactions', filters);
  }
}