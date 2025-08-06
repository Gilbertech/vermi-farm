import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          name: string;
          phone: string;
          role: 'super_admin' | 'admin_initiator';
          status: 'active' | 'inactive';
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          role: 'super_admin' | 'admin_initiator';
          status?: 'active' | 'inactive';
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          role?: 'super_admin' | 'admin_initiator';
          status?: 'active' | 'inactive';
          last_login?: string | null;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string;
          role: 'chairperson' | 'member' | 'secretary' | 'treasurer';
          group_id: string | null;
          balance: number;
          status: 'active' | 'inactive';
          pin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone: string;
          role?: 'chairperson' | 'member' | 'secretary' | 'treasurer';
          group_id?: string | null;
          balance?: number;
          status?: 'active' | 'inactive';
          pin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          role?: 'chairperson' | 'member' | 'secretary' | 'treasurer';
          group_id?: string | null;
          balance?: number;
          status?: 'active' | 'inactive';
          pin?: string | null;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          reg_no: string | null;
          location: string | null;
          description: string;
          admin_id: string;
          total_balance: number;
          loan_limit: number;
          interest_rate: number;
          active_loans: number;
          total_disbursed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          reg_no?: string | null;
          location?: string | null;
          description: string;
          admin_id: string;
          total_balance?: number;
          loan_limit?: number;
          interest_rate?: number;
          active_loans?: number;
          total_disbursed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          reg_no?: string | null;
          location?: string | null;
          description?: string;
          admin_id?: string;
          total_balance?: number;
          loan_limit?: number;
          interest_rate?: number;
          active_loans?: number;
          total_disbursed?: number;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          tx_code: string;
          type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
          amount: number;
          fees: number;
          user_id: string;
          group_id: string | null;
          from_account: string;
          to_account: string;
          description: string;
          status: 'completed' | 'pending' | 'failed';
          mpesa_receipt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tx_code: string;
          type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
          amount: number;
          fees?: number;
          user_id: string;
          group_id?: string | null;
          from_account: string;
          to_account: string;
          description: string;
          status?: 'completed' | 'pending' | 'failed';
          mpesa_receipt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tx_code?: string;
          type?: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'transfer';
          amount?: number;
          fees?: number;
          user_id?: string;
          group_id?: string | null;
          from_account?: string;
          to_account?: string;
          description?: string;
          status?: 'completed' | 'pending' | 'failed';
          mpesa_receipt?: string | null;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          amount: number;
          repaid_amount: number;
          interest_rate: number;
          due_date: string;
          status: 'active' | 'completed' | 'overdue';
          type: 'group' | 'individual';
          purpose: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id: string;
          amount: number;
          repaid_amount?: number;
          interest_rate: number;
          due_date: string;
          status?: 'active' | 'completed' | 'overdue';
          type: 'group' | 'individual';
          purpose?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string;
          amount?: number;
          repaid_amount?: number;
          interest_rate?: number;
          due_date?: string;
          status?: 'active' | 'completed' | 'overdue';
          type?: 'group' | 'individual';
          purpose?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          tx_code: string;
          payment_type: 'single' | 'paybill' | 'buygoods' | 'bulk' | 'b2b';
          initiator_id: string;
          recipient_name: string;
          recipient_msisdn: string | null;
          paybill_number: string | null;
          account_number: string | null;
          business_number: string | null;
          amount: number;
          cost: number;
          mpesa_receipt: string | null;
          description: string | null;
          status: 'completed' | 'pending' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tx_code: string;
          payment_type: 'single' | 'paybill' | 'buygoods' | 'bulk' | 'b2b';
          initiator_id: string;
          recipient_name: string;
          recipient_msisdn?: string | null;
          paybill_number?: string | null;
          account_number?: string | null;
          business_number?: string | null;
          amount: number;
          cost?: number;
          mpesa_receipt?: string | null;
          description?: string | null;
          status?: 'completed' | 'pending' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tx_code?: string;
          payment_type?: 'single' | 'paybill' | 'buygoods' | 'bulk' | 'b2b';
          initiator_id?: string;
          recipient_name?: string;
          recipient_msisdn?: string | null;
          paybill_number?: string | null;
          account_number?: string | null;
          business_number?: string | null;
          amount?: number;
          cost?: number;
          mpesa_receipt?: string | null;
          description?: string | null;
          status?: 'completed' | 'pending' | 'failed';
          updated_at?: string;
        };
      };
      portfolio_transactions: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tx_code: string;
          portfolio_type: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
          from_account: string;
          to_account: string;
          amount: number;
          fees?: number;
          status?: 'completed' | 'pending' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tx_code?: string;
          portfolio_type?: 'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings';
          from_account?: string;
          to_account?: string;
          amount?: number;
          fees?: number;
          status?: 'completed' | 'pending' | 'failed';
          updated_at?: string;
        };
      };
      reversal_requests: {
        Row: {
          id: string;
          tx_code: string;
          initiated_by: string;
          transaction_type: string;
          amount: number;
          transaction_time: string;
          from_account: string;
          to_account: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tx_code: string;
          initiated_by: string;
          transaction_type: string;
          amount: number;
          transaction_time: string;
          from_account: string;
          to_account: string;
          reason: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tx_code?: string;
          initiated_by?: string;
          transaction_type?: string;
          amount?: number;
          transaction_time?: string;
          from_account?: string;
          to_account?: string;
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
          updated_at?: string;
        };
      };
      otp_codes: {
        Row: {
          id: string;
          phone: string;
          code: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          code: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          code?: string;
          expires_at?: string;
          used?: boolean;
        };
      };
      ussd_sessions: {
        Row: {
          id: string;
          session_id: string;
          phone_number: string;
          user_id: string | null;
          current_menu: string;
          menu_data: any;
          status: 'active' | 'completed' | 'expired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          phone_number: string;
          user_id?: string | null;
          current_menu: string;
          menu_data?: any;
          status?: 'active' | 'completed' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          phone_number?: string;
          user_id?: string | null;
          current_menu?: string;
          menu_data?: any;
          status?: 'active' | 'completed' | 'expired';
          updated_at?: string;
        };
      };
    };
  };
}