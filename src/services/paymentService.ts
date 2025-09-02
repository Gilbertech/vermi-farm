import { apiClient, PaginatedResponse } from './api';

export interface Payment {
  id: string;
  tx_code: string;
  payment_type: 'normal' | 'b2b' | 'paybill' | 'buygoods' | 'bulk';
  initiator_id: string;
  recipient_name: string;
  recipient_msisdn: string;
  paybill_number?: string;
  account_number?: string;
  business_number?: string;
  amount: number;
  cost: number;
  mpesa_receipt?: string;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface SinglePaymentRequest {
  recipient_name: string;
  recipient_msisdn: string;
  amount: number;
  purpose: string;
}

export interface PaybillPaymentRequest {
  paybill_number: string;
  account_number: string;
  amount: number;
}

export interface BuyGoodsPaymentRequest {
  business_number: string;
  amount: number;
}

export interface BulkPaymentRequest {
  payments: Array<{
    recipient_name: string;
    recipient_msisdn: string;
    amount: number;
  }>;
  reference_label?: string;
  scheduled_date?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  payment_type?: 'normal' | 'b2b' | 'paybill' | 'buygoods' | 'bulk';
  status?: 'completed' | 'pending' | 'failed';
  initiator_id?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

export class PaymentService {
  static async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>('/payments', filters);
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

  static async createBulkPayment(paymentData: BulkPaymentRequest): Promise<Payment[]> {
    return apiClient.post<Payment[]>('/payments/bulk', paymentData);
  }

  static async uploadBulkPayments(file: File): Promise<{ preview: any[]; total_amount: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<{ preview: any[]; total_amount: number }>('/upload/bulk-payments', formData);
  }
}