import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Group = Tables['groups']['Row'];
type Transaction = Tables['transactions']['Row'];
type Loan = Tables['loans']['Row'];
type Payment = Tables['payments']['Row'];
type AdminUser = Tables['admin_users']['Row'];

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

// Authentication API
export const authApi = {
  async login(phone: string, password: string): Promise<ApiResponse<{ user: AdminUser; requires_otp: boolean }>> {
    try {
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('phone', phone)
        .eq('status', 'active')
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid phone number or user not found' };
      }

      // In production, verify password hash here
      // For demo, we'll accept 'admin123' for all users
      if (password !== 'admin123') {
        return { success: false, error: 'Invalid password' };
      }

      // Generate and send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      await supabase
        .from('otp_codes')
        .insert({
          phone,
          code: otpCode,
          expires_at: expiresAt,
          used: false
        });

      // In production, send SMS here
      console.log(`OTP for ${phone}: ${otpCode}`);

      return {
        success: true,
        data: {
          user,
          requires_otp: true
        }
      };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  async verifyOTP(phone: string, code: string): Promise<ApiResponse<{ user: AdminUser; access_token: string }>> {
    try {
      // Check OTP
      const { data: otpRecord, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (otpError || !otpRecord) {
        return { success: false, error: 'Invalid or expired OTP code' };
      }

      // Mark OTP as used
      await supabase
        .from('otp_codes')
        .update({ used: true })
        .eq('id', otpRecord.id);

      // Get user
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (userError || !user) {
        return { success: false, error: 'User not found' };
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // In production, generate JWT token here
      const accessToken = `demo_token_${user.id}_${Date.now()}`;

      return {
        success: true,
        data: {
          user,
          access_token: accessToken
        }
      };
    } catch (error) {
      return { success: false, error: 'OTP verification failed' };
    }
  },

  async sendOTP(phone: string): Promise<ApiResponse<{ otp_sent: boolean }>> {
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabase
        .from('otp_codes')
        .insert({
          phone,
          code: otpCode,
          expires_at: expiresAt,
          used: false
        });

      console.log(`New OTP for ${phone}: ${otpCode}`);
      return { success: true, data: { otp_sent: true } };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }
};

// Users API
export const usersApi = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    group_id?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      let query = supabase.from('users').select('*', { count: 'exact' });

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
      }
      if (params?.role) {
        query = query.eq('role', params.role);
      }
      if (params?.group_id) {
        query = query.eq('group_id', params.group_id);
      }
      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          data: data || [],
          pagination: {
            current_page: page,
            total_pages: Math.ceil((count || 0) / limit),
            total_items: count || 0,
            per_page: limit
          }
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch users' };
    }
  },

  async createUser(userData: Tables['users']['Insert']): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create user' };
    }
  },

  async updateUser(id: string, updates: Tables['users']['Update']): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  },

  async resetUserPin(userId: string): Promise<ApiResponse<{ new_pin: string }>> {
    try {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { error } = await supabase
        .from('users')
        .update({ pin: newPin, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: { new_pin: newPin } };
    } catch (error) {
      return { success: false, error: 'Failed to reset PIN' };
    }
  }
};

// Groups API
export const groupsApi = {
  async getGroups(params?: {
    search?: string;
    location?: string;
  }): Promise<ApiResponse<Group[]>> {
    try {
      let query = supabase.from('groups').select('*');

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,reg_no.ilike.%${params.search}%`);
      }
      if (params?.location) {
        query = query.ilike('location', `%${params.location}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch groups' };
    }
  },

  async createGroup(groupData: Tables['groups']['Insert']): Promise<ApiResponse<Group>> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create group' };
    }
  },

  async updateGroup(id: string, updates: Tables['groups']['Update']): Promise<ApiResponse<Group>> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update group' };
    }
  },

  async updateExecutives(groupId: string, executives: {
    secretary?: string;
    chairperson?: string;
    treasurer?: string;
  }): Promise<ApiResponse<boolean>> {
    try {
      // First, reset all executive roles in the group to 'member'
      await supabase
        .from('users')
        .update({ role: 'member', updated_at: new Date().toISOString() })
        .eq('group_id', groupId)
        .in('role', ['secretary', 'chairperson', 'treasurer']);

      // Then assign new roles
      const updates = [];
      if (executives.secretary) {
        updates.push(
          supabase
            .from('users')
            .update({ role: 'secretary', updated_at: new Date().toISOString() })
            .eq('id', executives.secretary)
        );
      }
      if (executives.chairperson) {
        updates.push(
          supabase
            .from('users')
            .update({ role: 'chairperson', updated_at: new Date().toISOString() })
            .eq('id', executives.chairperson)
        );
      }
      if (executives.treasurer) {
        updates.push(
          supabase
            .from('users')
            .update({ role: 'treasurer', updated_at: new Date().toISOString() })
            .eq('id', executives.treasurer)
        );
      }

      await Promise.all(updates);

      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: 'Failed to update executives' };
    }
  }
};

// Transactions API
export const transactionsApi = {
  async getTransactions(params?: {
    type?: string;
    status?: string;
    user_id?: string;
    group_id?: string;
    amount_min?: number;
    amount_max?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    try {
      let query = supabase.from('transactions').select('*');

      if (params?.type) query = query.eq('type', params.type);
      if (params?.status) query = query.eq('status', params.status);
      if (params?.user_id) query = query.eq('user_id', params.user_id);
      if (params?.group_id) query = query.eq('group_id', params.group_id);
      if (params?.amount_min) query = query.gte('amount', params.amount_min);
      if (params?.amount_max) query = query.lte('amount', params.amount_max);
      if (params?.date_from) query = query.gte('created_at', params.date_from);
      if (params?.date_to) query = query.lte('created_at', params.date_to);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch transactions' };
    }
  },

  async createTransaction(transactionData: Tables['transactions']['Insert']): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create transaction' };
    }
  }
};

// Loans API
export const loansApi = {
  async getLoans(params?: {
    type?: 'group' | 'individual';
    status?: string;
    user_id?: string;
    group_id?: string;
  }): Promise<ApiResponse<Loan[]>> {
    try {
      let query = supabase.from('loans').select('*');

      if (params?.type) query = query.eq('type', params.type);
      if (params?.status) query = query.eq('status', params.status);
      if (params?.user_id) query = query.eq('user_id', params.user_id);
      if (params?.group_id) query = query.eq('group_id', params.group_id);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch loans' };
    }
  },

  async createLoan(loanData: Tables['loans']['Insert']): Promise<ApiResponse<Loan>> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert(loanData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create loan' };
    }
  }
};

// Payments API
export const paymentsApi = {
  async getPayments(params?: {
    payment_type?: string;
    status?: string;
    initiator_id?: string;
  }): Promise<ApiResponse<Payment[]>> {
    try {
      let query = supabase.from('payments').select('*');

      if (params?.payment_type) query = query.eq('payment_type', params.payment_type);
      if (params?.status) query = query.eq('status', params.status);
      if (params?.initiator_id) query = query.eq('initiator_id', params.initiator_id);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch payments' };
    }
  },

  async createPayment(paymentData: Tables['payments']['Insert']): Promise<ApiResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create payment' };
    }
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToTransactions(callback: (payload: any) => void) {
    return supabase
      .channel('transactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' }, 
        callback
      )
      .subscribe();
  },

  subscribeToLoans(callback: (payload: any) => void) {
    return supabase
      .channel('loans')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loans' }, 
        callback
      )
      .subscribe();
  },

  subscribeToUsers(callback: (payload: any) => void) {
    return supabase
      .channel('users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        callback
      )
      .subscribe();
  },

  subscribeToGroups(callback: (payload: any) => void) {
    return supabase
      .channel('groups')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groups' }, 
        callback
      )
      .subscribe();
  }
};

// USSD Integration API
export const ussdApi = {
  async handleUSSDRequest(sessionId: string, phoneNumber: string, text: string): Promise<ApiResponse<{
    response: string;
    continue_session: boolean;
  }>> {
    try {
      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .single();

      // Create or update USSD session
      await supabase
        .from('ussd_sessions')
        .upsert({
          session_id: sessionId,
          phone_number: phoneNumber,
          user_id: user?.id || null,
          current_menu: text || 'main',
          menu_data: {},
          status: 'active'
        });

      // Process USSD menu logic
      const response = await processUSSDMenu(text, user, phoneNumber);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'USSD processing failed',
        data: {
          response: 'Service temporarily unavailable. Please try again later.',
          continue_session: false
        }
      };
    }
  }
};

// USSD Menu Processing
async function processUSSDMenu(text: string, user: User | null, phoneNumber: string): Promise<{
  response: string;
  continue_session: boolean;
}> {
  const input = text.split('*');
  const lastInput = input[input.length - 1];

  // Main menu
  if (text === '' || text === '*702*44#') {
    if (!user) {
      return {
        response: `Welcome to Vermi-Farm!\nPhone ${phoneNumber} not registered.\nPlease contact admin to register.\n\n0. Exit`,
        continue_session: true
      };
    }

    return {
      response: `Welcome ${user.name}!\nVermi-Farm Services\n\n1. Check Balance\n2. Loan Services\n3. Group Info\n4. Transaction History\n5. Make Payment\n0. Exit`,
      continue_session: true
    };
  }

  // Balance inquiry
  if (lastInput === '1') {
    if (!user) {
      return {
        response: 'User not found. Please contact admin.',
        continue_session: false
      };
    }

    return {
      response: `Account Balance\nName: ${user.name}\nBalance: KES ${user.balance.toLocaleString()}\nStatus: ${user.status}\n\n0. Main Menu\n00. Exit`,
      continue_session: true
    };
  }

  // Loan services
  if (lastInput === '2') {
    return {
      response: `Loan Services\n\n1. Apply for Loan\n2. Check Loan Status\n3. Make Repayment\n\n0. Main Menu\n00. Exit`,
      continue_session: true
    };
  }

  // Group information
  if (lastInput === '3') {
    if (!user?.group_id) {
      return {
        response: 'You are not assigned to any group.\nPlease contact admin.',
        continue_session: false
      };
    }

    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('id', user.group_id)
      .single();

    if (!group) {
      return {
        response: 'Group information not found.',
        continue_session: false
      };
    }

    return {
      response: `Group Information\nName: ${group.name}\nLocation: ${group.location || 'N/A'}\nBalance: KES ${group.total_balance.toLocaleString()}\nLoan Limit: KES ${group.loan_limit.toLocaleString()}\n\n0. Main Menu\n00. Exit`,
      continue_session: true
    };
  }

  // Exit options
  if (lastInput === '0') {
    return {
      response: `Welcome ${user?.name || 'User'}!\nVermi-Farm Services\n\n1. Check Balance\n2. Loan Services\n3. Group Info\n4. Transaction History\n5. Make Payment\n0. Exit`,
      continue_session: true
    };
  }

  if (lastInput === '00') {
    return {
      response: 'Thank you for using Vermi-Farm services!',
      continue_session: false
    };
  }

  // Default response for invalid input
  return {
    response: 'Invalid option. Please try again.\n\n0. Main Menu\n00. Exit',
    continue_session: true
  };
}

// Analytics API
export const analyticsApi = {
  async getDashboardStats(): Promise<ApiResponse<{
    total_users: number;
    total_groups: number;
    completed_transactions: number;
    total_transacted: number;
    total_loan_disbursed: number;
    total_loan_repaid: number;
    total_earned: number;
  }>> {
    try {
      const [usersCount, groupsCount, transactionsData, loansData] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount, status'),
        supabase.from('loans').select('amount, repaid_amount, interest_rate')
      ]);

      const completedTransactions = transactionsData.data?.filter(t => t.status === 'completed') || [];
      const totalTransacted = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalLoanDisbursed = loansData.data?.reduce((sum, l) => sum + l.amount, 0) || 0;
      const totalLoanRepaid = loansData.data?.reduce((sum, l) => sum + l.repaid_amount, 0) || 0;
      const totalEarned = loansData.data?.reduce((sum, l) => sum + (l.amount * l.interest_rate / 100), 0) || 0;

      return {
        success: true,
        data: {
          total_users: usersCount.count || 0,
          total_groups: groupsCount.count || 0,
          completed_transactions: completedTransactions.length,
          total_transacted: totalTransacted,
          total_loan_disbursed: totalLoanDisbursed,
          total_loan_repaid: totalLoanRepaid,
          total_earned: totalEarned
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch dashboard stats' };
    }
  }
};