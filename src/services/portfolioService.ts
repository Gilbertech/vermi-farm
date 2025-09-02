import { apiClient, PaginatedResponse } from './api';

export interface PortfolioTransaction {
  id: string;
  tx_code: string;
  portfolio_type: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
  from_account: string;
  to_account: string;
  amount: number;
  fees: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PortfolioTransferRequest {
  from_portfolio: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
  to_portfolio: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
  amount: number;
  description: string;
  reference?: string;
}

export interface PortfolioStats {
  total_balance: number;
  total_transactions: number;
  total_fees: number;
  monthly_growth: number;
  weekly_transactions: number;
}

export interface PortfolioFilters {
  page?: number;
  limit?: number;
  status?: 'completed' | 'pending' | 'failed';
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

export class PortfolioService {
  static async getPortfolioTransactions(
    portfolioType: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings',
    filters?: PortfolioFilters
  ): Promise<PaginatedResponse<PortfolioTransaction>> {
    return apiClient.get<PaginatedResponse<PortfolioTransaction>>(`/portfolios/${portfolioType}/transactions`, filters);
  }

  static async transferBetweenPortfolios(transferData: PortfolioTransferRequest): Promise<PortfolioTransaction> {
    return apiClient.post<PortfolioTransaction>('/portfolios/transfer', transferData);
  }

  static async getPortfolioStats(
    portfolioType: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings'
  ): Promise<PortfolioStats> {
    return apiClient.get<PortfolioStats>(`/portfolios/${portfolioType}/stats`);
  }
}