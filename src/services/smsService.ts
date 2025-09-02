import { apiClient } from './api';

export interface SendSMSRequest {
  phone: string;
  message: string;
  type?: 'otp' | 'notification' | 'reminder';
}

export interface BulkSMSRequest {
  recipients: string[];
  message: string;
}

export interface SMSResponse {
  message_id: string;
  status: 'sent' | 'failed';
  cost: number;
  recipient: string;
}

export class SMSService {
  static async sendSMS(data: SendSMSRequest): Promise<SMSResponse> {
    return apiClient.post<SMSResponse>('/sms/send', data);
  }

  static async sendBulkSMS(data: BulkSMSRequest): Promise<SMSResponse[]> {
    return apiClient.post<SMSResponse[]>('/sms/bulk', data);
  }
}