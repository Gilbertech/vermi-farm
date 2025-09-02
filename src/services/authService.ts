import { apiClient } from './api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
  requires_otp: boolean;
  otp_sent: boolean;
}

export interface OTPVerificationRequest {
  phone: string;
  otp: string;
}

export interface OTPVerificationResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
}

export interface PasswordResetRequest {
  phone: string;
}

export interface SendOTPRequest {
  phone: string;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  static async verifyOTP(data: OTPVerificationRequest): Promise<OTPVerificationResponse> {
    const response = await apiClient.post<OTPVerificationResponse>('/auth/verify-otp', data);
    
    // Store tokens
    apiClient.setToken(response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    return response;
  }

  static async sendOTP(data: SendOTPRequest): Promise<void> {
    return apiClient.post<void>('/auth/send-otp', data);
  }

  static async resetPassword(data: PasswordResetRequest): Promise<void> {
    return apiClient.post<void>('/auth/reset-password', data);
  }

  static async refreshToken(): Promise<OTPVerificationResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return apiClient.post<OTPVerificationResponse>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout');
    } finally {
      apiClient.clearToken();
    }
  }
}