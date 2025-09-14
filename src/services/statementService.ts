import { apiClient, PaginatedResponse } from './api';

export interface Statement {
  id: string;
  statement_number: string;
  from_date: string;
  to_date: string;
  user_id?: string;
  user_name?: string;
  group_id?: string;
  group_name?: string;
  statement_type: 'user' | 'group' | 'account' | 'portfolio' | 'loan' | 'custom';
  format: 'pdf' | 'csv' | 'xlsx';
  file_path: string;
  file_size: number;
  status: 'generating' | 'completed' | 'failed' | 'expired';
  generated_by: string;
  generated_by_name: string;
  download_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateStatementRequest {
  from_date: string;
  to_date: string;
  user_id?: string;
  group_id?: string;
  statement_type: 'user' | 'group' | 'account' | 'portfolio' | 'loan' | 'custom';
  format: 'pdf' | 'csv' | 'xlsx';
  include_transactions?: boolean;
  include_loans?: boolean;
  include_payments?: boolean;
  include_analytics?: boolean;
  custom_fields?: string[];
  template_id?: string;
}

export interface StatementFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  group_id?: string;
  statement_type?: 'user' | 'group' | 'account' | 'portfolio' | 'loan' | 'custom';
  format?: 'pdf' | 'csv' | 'xlsx';
  status?: 'generating' | 'completed' | 'failed' | 'expired';
  generated_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface StatementTemplate {
  id: string;
  name: string;
  description: string;
  statement_type: string;
  format: 'pdf' | 'csv' | 'xlsx';
  fields: Array<{
    field_name: string;
    display_name: string;
    data_type: 'string' | 'number' | 'date' | 'currency';
    required: boolean;
    format_options?: any;
  }>;
  layout_config?: any;
  created_by: string;
  created_at: string;
}

export interface StatementStats {
  total_statements: number;
  statements_this_month: number;
  statements_by_type: Record<string, number>;
  statements_by_format: Record<string, number>;
  statements_by_status: Record<string, number>;
  average_generation_time: number;
  total_downloads: number;
  popular_templates: Array<{
    template_id: string;
    template_name: string;
    usage_count: number;
  }>;
}

export interface BulkStatementRequest {
  statements: Array<{
    user_id?: string;
    group_id?: string;
    from_date: string;
    to_date: string;
    statement_type: string;
    format: 'pdf' | 'csv' | 'xlsx';
  }>;
  batch_name?: string;
  notification_settings?: {
    notify_users?: boolean;
    email_template?: string;
    sms_template?: string;
  };
}

export interface BulkStatementResponse {
  batch_id: string;
  total_statements: number;
  successful: number;
  failed: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  estimated_completion: string;
}

export class StatementService {
  // Statement management
  static async getStatements(filters?: StatementFilters): Promise<PaginatedResponse<Statement>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<Statement>>('/statements', params);
  }

  static async getStatementById(id: string): Promise<Statement> {
    return apiClient.get<Statement>(`/statements/${id}`);
  }

  static async generateStatement(statementData: GenerateStatementRequest): Promise<Statement> {
    return apiClient.post<Statement>('/statements/generate', statementData);
  }

  static async regenerateStatement(id: string): Promise<Statement> {
    return apiClient.post<Statement>(`/statements/${id}/regenerate`);
  }

  static async deleteStatement(id: string): Promise<void> {
    return apiClient.delete<void>(`/statements/${id}`);
  }

  // Statement download and sharing
  static async downloadStatement(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/statements/${id}/download`, {
      headers: apiClient['getHeaders'](),
    });

    if (!response.ok) {
      throw new Error('Failed to download statement');
    }

    return response.blob();
  }

  static async getStatementDownloadUrl(id: string, expires_in_hours = 24): Promise<{
    download_url: string;
    expires_at: string;
  }> {
    return apiClient.post<any>(`/statements/${id}/download-url`, { expires_in_hours });
  }

  static async shareStatement(id: string, data: {
    recipients: string[];
    message?: string;
    method: 'email' | 'sms' | 'both';
    expires_in_hours?: number;
  }): Promise<{
    shared: number;
    failed: number;
    results: Array<{ recipient: string; status: string; message?: string }>;
  }> {
    return apiClient.post<any>(`/statements/${id}/share`, data);
  }

  // Bulk statement operations
  static async generateBulkStatements(data: BulkStatementRequest): Promise<BulkStatementResponse> {
    return apiClient.post<BulkStatementResponse>('/statements/bulk', data);
  }

  static async getBulkStatementStatus(batchId: string): Promise<BulkStatementResponse & {
    statements: Array<{
      statement_id: string;
      user_id?: string;
      group_id?: string;
      status: string;
      error_message?: string;
    }>;
  }> {
    return apiClient.get<any>(`/statements/bulk/${batchId}`);
  }

  // Statement templates
  static async getStatementTemplates(filters?: {
    statement_type?: string;
    format?: string;
    created_by?: string;
  }): Promise<StatementTemplate[]> {
    return apiClient.get<StatementTemplate[]>('/statements/templates', filters);
  }

  static async createStatementTemplate(templateData: {
    name: string;
    description: string;
    statement_type: string;
    format: 'pdf' | 'csv' | 'xlsx';
    fields: Array<{
      field_name: string;
      display_name: string;
      data_type: string;
      required: boolean;
      format_options?: any;
    }>;
    layout_config?: any;
  }): Promise<StatementTemplate> {
    return apiClient.post<StatementTemplate>('/statements/templates', templateData);
  }

  static async updateStatementTemplate(id: string, updates: Partial<StatementTemplate>): Promise<StatementTemplate> {
    return apiClient.put<StatementTemplate>(`/statements/templates/${id}`, updates);
  }

  static async deleteStatementTemplate(id: string): Promise<void> {
    return apiClient.delete<void>(`/statements/templates/${id}`);
  }

  // Statement analytics
  static async getStatementStats(filters?: {
    date_from?: string;
    date_to?: string;
    statement_type?: string;
    generated_by?: string;
  }): Promise<StatementStats> {
    return apiClient.get<StatementStats>('/statements/stats', filters);
  }

  static async getStatementAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    generation_timeline: Record<string, number>;
    download_timeline: Record<string, number>;
    popular_statement_types: Record<string, number>;
    user_engagement: {
      statements_per_user: number;
      downloads_per_statement: number;
      most_active_users: Array<{
        user_id: string;
        user_name: string;
        statement_count: number;
      }>;
    };
  }> {
    return apiClient.get<any>('/statements/analytics', filters);
  }

  // Statement search
  static async searchStatements(query: string, filters?: {
    limit?: number;
    statement_type?: string;
    format?: string;
    status?: string;
  }): Promise<Statement[]> {
    return apiClient.get<Statement[]>('/statements/search', { q: query, ...filters });
  }

  // Statement validation and preview
  static async validateStatementData(data: GenerateStatementRequest): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    estimated_size: number;
    estimated_generation_time: number;
    record_count: number;
  }> {
    return apiClient.post<any>('/statements/validate', data);
  }

  static async previewStatement(data: GenerateStatementRequest): Promise<{
    preview_data: any[];
    total_records: number;
    summary: Record<string, any>;
  }> {
    return apiClient.post<any>('/statements/preview', data);
  }

  // Statement scheduling
  static async scheduleStatement(data: GenerateStatementRequest & {
    schedule_type: 'once' | 'daily' | 'weekly' | 'monthly';
    schedule_date?: string;
    recipients?: string[];
    auto_share?: boolean;
  }): Promise<{
    schedule_id: string;
    next_generation: string;
    status: 'scheduled';
  }> {
    return apiClient.post<any>('/statements/schedule', data);
  }

  static async getScheduledStatements(): Promise<Array<{
    id: string;
    name: string;
    schedule_type: string;
    next_generation: string;
    last_generation?: string;
    status: 'active' | 'paused' | 'cancelled';
    recipients: string[];
    created_at: string;
  }>> {
    return apiClient.get<any[]>('/statements/scheduled');
  }

  static async updateScheduledStatement(id: string, data: {
    schedule_type?: string;
    schedule_date?: string;
    recipients?: string[];
    status?: 'active' | 'paused' | 'cancelled';
  }): Promise<any> {
    return apiClient.put<any>(`/statements/scheduled/${id}`, data);
  }

  // Statement archival and cleanup
  static async archiveStatement(id: string): Promise<Statement> {
    return apiClient.post<Statement>(`/statements/${id}/archive`);
  }

  static async getArchivedStatements(filters?: StatementFilters): Promise<PaginatedResponse<Statement>> {
    return apiClient.get<PaginatedResponse<Statement>>('/statements/archived', filters);
  }

  static async cleanupExpiredStatements(): Promise<{
    deleted_count: number;
    freed_space_mb: number;
  }> {
    return apiClient.post<any>('/statements/cleanup');
  }
}