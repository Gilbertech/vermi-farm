import { apiClient } from './api';

export interface STKPushRequest {
  phone: string;
  amount: number;
  account_reference: string;
  transaction_desc: string;
}

export interface STKPushResponse {
  merchant_request_id: string;
  checkout_request_id: string;
  response_code: string;
  response_description: string;
  customer_message: string;
}

export interface TransactionStatusResponse {
  merchant_request_id: string;
  checkout_request_id: string;
  result_code: string;
  result_desc: string;
  amount?: number;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  phone_number?: string;
}

export interface MPesaCallbackData {
  merchant_request_id: string;
  checkout_request_id: string;
  result_code: number;
  result_desc: string;
  amount?: number;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  phone_number?: string;
}

export class MPesaService {
  static async initiateSTKPush(data: STKPushRequest): Promise<STKPushResponse> {
    return apiClient.post<STKPushResponse>('/mpesa/stk-push', data);
  }

  static async getTransactionStatus(checkoutRequestId: string): Promise<TransactionStatusResponse> {
    return apiClient.get<TransactionStatusResponse>(`/mpesa/transaction-status/${checkoutRequestId}`);
  }

  // Note: The callback endpoint is handled by the backend automatically
  // This is just for reference - the frontend doesn't call this directly
  static async handleCallback(callbackData: MPesaCallbackData): Promise<void> {
    return apiClient.post<void>('/mpesa/callback', callbackData);
  }
}