import { apiClient, PaginatedResponse } from './api';

export interface Statement {
  id: string;
  from_date: string;
  to_date: string;
  user_id?: string;
  group_id?: string;
  statement_type: string;
  file_path: string;
  created_at: string;
}

export interface GenerateStatementRequest {
  from_date: string;
  to_date: string;
  user_id?: string;
  group_id?: string;
  format: 'pdf' | 'csv';
}

export interface StatementFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  group_id?: string;
  statement_type?: string;
  date_from?: string;
  date_to?: string;
}

export class StatementService {
  static async getStatements(filters?: StatementFilters): Promise<PaginatedResponse<Statement>> {
    return apiClient.get<PaginatedResponse<Statement>>('/statements', filters);
  }

  static async generateStatement(statementData: GenerateStatementRequest): Promise<Statement> {
    return apiClient.post<Statement>('/statements/generate', statementData);
  }

  static async downloadStatement(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/statements/${id}/download`, {
      headers: apiClient['getHeaders'](),
    });

    if (!response.ok) {
      throw new Error('Failed to download statement');
    }

    return response.blob();
  }
}