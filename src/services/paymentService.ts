import { apiClient, PaginatedResponse } from './api';

export interface Payment {
  id: string;
  tx_code: string;
  payment_type: 'single' | 'paybill' | 'buygoods' | 'bulk' | 'b2b' | 'salary' | 'supplier';
  initiator_id: string;
  initiator_name: string;
  recipient_name: string;
  recipient_msisdn: string;
  paybill_number?: string;
  account_number?: string;
  business_number?: string;
  amount: number;
  cost: number;
  mpesa_receipt?: string;
  description?: string;
  reference_number?: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  failure_reason?: string;
  approved_by?: string;
  approved_at?: string;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface SinglePaymentRequest {
  recipient_name: string;
  recipient_msisdn: string;
  amount: number;
  purpose: string;
  reference_number?: string;
  scheduled_date?: string;
}

export interface PaybillPaymentRequest {
  paybill_number: string;
  account_number: string;
  amount: number;
  description?: string;
  reference_number?: string;
}

export interface BuyGoodsPaymentRequest {
  business_number: string;
  amount: number;
  description?: string;
  reference_number?: string;
}

export interface BulkPaymentRequest {
  payments: Array<{
    recipient_name: string;
    recipient_msisdn: string;
    amount: number;
    reference?: string;
  }>;
  reference_label?: string;
  scheduled_date?: string;
  notification_message?: string;
}

export interface B2BPaymentRequest {
  business_name: string;
  business_number: string;
  amount: number;
  description: string;
  invoice_number?: string;
  due_date?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  payment_type?: 'single' | 'paybill' | 'buygoods' | 'bulk' | 'b2b';
  status?: 'completed' | 'pending' | 'failed' | 'cancelled';
  initiator_id?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  mpesa_receipt?: string;
  scheduled?: boolean;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  total_cost: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  average_payment_amount: number;
  payments_by_type: Record<string, number>;
  payments_by_status: Record<string, number>;
  cost_analysis: {
    total_fees: number;
    average_fee_percentage: number;
    fee_by_type: Record<string, number>;
  };
}

export interface BulkPaymentStatus {
  batch_id: string;
  total_payments: number;
  successful: number;
  failed: number;
  pending: number;
  total_amount: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface PaymentValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  estimated_cost: number;
  estimated_completion_time: string;
}

export class PaymentService {
  // Enhanced payment listing with advanced filtering
  static async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    const params = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 50, 1000),
      ...filters
    };
    return apiClient.get<PaginatedResponse<Payment>>('/payments', params);
  }

  // Payment type specific endpoints
  static async getSinglePayments(filters?: Omit<PaymentFilters, 'payment_type'>): Promise<PaginatedResponse<Payment>> {
    return this.getPayments({ ...filters, payment_type: 'single' });
  }

  static async getPaybillPayments(filters?: Omit<PaymentFilters, 'payment_type'>): Promise<PaginatedResponse<Payment>> {
    return this.getPayments({ ...filters, payment_type: 'paybill' });
  }

  static async getBuyGoodsPayments(filters?: Omit<PaymentFilters, 'payment_type'>): Promise<PaginatedResponse<Payment>> {
    return this.getPayments({ ...filters, payment_type: 'buygoods' });
  }

  static async getB2BPayments(filters?: Omit<PaymentFilters, 'payment_type'>): Promise<PaginatedResponse<Payment>> {
    return this.getPayments({ ...filters, payment_type: 'b2b' });
  }

  // Payment CRUD operations
  static async getPaymentById(id: string): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${id}`);
  }

  static async createSinglePayment(paymentData: SinglePaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments/single', paymentData);
  }

  static async createPaybillPayment(paymentData: PaybillPaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments/paybill', paymentData);
  }

  static async createBuyGoodsPayment(paymentData: BuyGoodsPaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments/buygoods', paymentData);
  }

  static async createBulkPayment(paymentData: BulkPaymentRequest): Promise<BulkPaymentStatus> {
    return apiClient.post<BulkPaymentStatus>('/payments/bulk', paymentData);
  }

  static async createB2BPayment(paymentData: B2BPaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments/b2b', paymentData);
  }

  // Payment status management
  static async approvePayment(id: string, notes?: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}/approve`, { notes });
  }

  static async rejectPayment(id: string, reason: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}/reject`, { reason });
  }

  static async cancelPayment(id: string, reason: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}/cancel`, { reason });
  }

  static async retryPayment(id: string): Promise<Payment> {
    return apiClient.post<Payment>(`/payments/${id}/retry`);
  }

  // Bulk payment management
  static async getBulkPaymentStatus(batchId: string): Promise<BulkPaymentStatus> {
    return apiClient.get<BulkPaymentStatus>(`/payments/bulk/${batchId}/status`);
  }

  static async getBulkPaymentDetails(batchId: string, filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>(`/payments/bulk/${batchId}/details`, filters);
  }

  static async cancelBulkPayment(batchId: string, reason: string): Promise<BulkPaymentStatus> {
    return apiClient.post<BulkPaymentStatus>(`/payments/bulk/${batchId}/cancel`, { reason });
  }

  // File upload and processing
  static async uploadBulkPayments(file: File): Promise<{
    preview: Array<{
      row: number;
      recipient_name: string;
      recipient_msisdn: string;
      amount: number;
      valid: boolean;
      errors?: string[];
    }>;
    total_amount: number;
    valid_count: number;
    invalid_count: number;
    upload_id: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<any>('/payments/bulk/upload', formData);
  }

  static async processBulkUpload(uploadId: string, options?: {
    skip_invalid?: boolean;
    send_notifications?: boolean;
    scheduled_date?: string;
  }): Promise<BulkPaymentStatus> {
    return apiClient.post<BulkPaymentStatus>(`/payments/bulk/process/${uploadId}`, options);
  }

  // Payment validation
  static async validatePayment(paymentData: any): Promise<PaymentValidation> {
    return apiClient.post<PaymentValidation>('/payments/validate', paymentData);
  }

  static async validateBulkPayments(payments: any[]): Promise<{
    valid_payments: any[];
    invalid_payments: Array<{ payment: any; errors: string[] }>;
    total_amount: number;
    estimated_cost: number;
  }> {
    return apiClient.post<any>('/payments/validate-bulk', { payments });
  }

  // Payment analytics
  static async getPaymentStats(filters?: {
    date_from?: string;
    date_to?: string;
    payment_type?: string;
    initiator_id?: string;
  }): Promise<PaymentStats> {
    return apiClient.get<PaymentStats>('/payments/stats', filters);
  }

  static async getPaymentAnalytics(filters?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    payment_timeline: Record<string, number>;
    cost_timeline: Record<string, number>;
    success_rate: Record<string, number>;
    popular_recipients: Array<{ name: string; count: number; amount: number }>;
    peak_hours: Record<string, number>;
  }> {
    return apiClient.get<any>('/payments/analytics', filters);
  }

  // Payment search
  static async searchPayments(query: string, filters?: {
    limit?: number;
    payment_type?: string;
    status?: string;
  }): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/search', { q: query, ...filters });
  }

  // Payment notifications
  static async getPaymentNotifications(paymentId: string): Promise<Array<{
    id: string;
    type: 'sms' | 'email' | 'push';
    recipient: string;
    message: string;
    status: 'sent' | 'failed' | 'pending';
    sent_at?: string;
  }>> {
    return apiClient.get<any[]>(`/payments/${paymentId}/notifications`);
  }

  static async resendPaymentNotification(paymentId: string, type: 'sms' | 'email'): Promise<{
    sent: boolean;
    message: string;
  }> {
    return apiClient.post<any>(`/payments/${paymentId}/notifications/resend`, { type });
  }

  // Payment reconciliation
  static async reconcilePayments(data: {
    date_from: string;
    date_to: string;
    payment_type?: string;
  }): Promise<{
    total_payments: number;
    matched: number;
    unmatched: number;
    discrepancies: Array<{
      payment_id: string;
      expected_amount: number;
      actual_amount: number;
      status: string;
    }>;
  }> {
    return apiClient.post<any>('/payments/reconcile', data);
  }

  // Scheduled payments
  static async getScheduledPayments(filters?: {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
    status?: 'pending' | 'processed' | 'cancelled';
  }): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>('/payments/scheduled', filters);
  }

  static async updateScheduledPayment(id: string, data: {
    scheduled_date?: string;
    amount?: number;
    status?: 'pending' | 'cancelled';
  }): Promise<Payment> {
    return apiClient.put<Payment>(`/payments/scheduled/${id}`, data);
  }

  // Payment limits and controls
  static async getPaymentLimits(): Promise<{
    daily_limit: number;
    monthly_limit: number;
    single_payment_limit: number;
    bulk_payment_limit: number;
    current_daily_usage: number;
    current_monthly_usage: number;
  }> {
    return apiClient.get<any>('/payments/limits');
  }

  static async updatePaymentLimits(limits: {
    daily_limit?: number;
    monthly_limit?: number;
    single_payment_limit?: number;
    bulk_payment_limit?: number;
  }): Promise<any> {
    return apiClient.put<any>('/payments/limits', limits);
  }
}