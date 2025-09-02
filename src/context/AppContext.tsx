import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserService, User as ApiUser, CreateUserRequest, UpdateUserRequest } from '../services/userService';
import { GroupService, Group as ApiGroup, CreateGroupRequest, UpdateGroupRequest, UpdateExecutivesRequest } from '../services/groupService';
import { TransactionService, Transaction as ApiTransaction, CreateTransactionRequest } from '../services/transactionService';
import { LoanService, Loan as ApiLoan, CreateLoanRequest } from '../services/loanService';
import { AnalyticsService, DashboardAnalytics } from '../services/analyticsService';
import { ApiError } from '../services/api';

// Convert API types to local types for compatibility
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'chairperson' | 'member' | 'secretary' | 'treasurer';
  groupId?: string;
  balance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  regNo?: string;
  location?: string;
  description: string;
  adminId: string;
  members: string[];
  totalBalance: number;
  loanLimit: number;
  interestRate?: number;
  activeLoans?: number;
  totalDisbursed?: number;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment';
  amount: number;
  userId: string;
  groupId?: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

interface Loan {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  repaidAmount: number;
  interestRate: number;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue';
  type: 'group' | 'individual';
  createdAt: string;
}

interface AppContextType {
  users: User[];
  groups: Group[];
  transactions: Transaction[];
  loans: Loan[];
  stats: {
    totalUsers: number;
    totalGroups: number;
    completedTransactions: number;
    totalTransacted: number;
    totalLoanDisbursed: number;
    totalLoanRepaid: number;
    totalEarned: number;
  };
  loading: boolean;
  error: string | null;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Promise<void>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  updateGroupExecutives: (groupId: string, executives: { secretary: string; chairperson: string; treasurer: string }) => Promise<void>;
  updateGroupLoanLimit: (groupId: string, loanLimit: number) => Promise<void>;
  updateGroupInterestRate: (groupId: string, interestRate: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  resetUserPin: (userId: string) => Promise<{ newPin: string; smsSent: boolean }>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Helper functions to convert API types to local types
const convertApiUserToLocal = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: '', // API doesn't have email field
  phone: apiUser.phone,
  role: apiUser.role,
  groupId: apiUser.group_id,
  balance: apiUser.balance,
  status: apiUser.status,
  createdAt: apiUser.created_at
});

const convertApiGroupToLocal = (apiGroup: ApiGroup): Group => ({
  id: apiGroup.id,
  name: apiGroup.name,
  regNo: apiGroup.reg_no,
  location: apiGroup.location,
  description: apiGroup.description,
  adminId: apiGroup.admin_id,
  members: [], // Will be populated separately
  totalBalance: apiGroup.total_balance,
  loanLimit: apiGroup.loan_limit,
  interestRate: apiGroup.interest_rate,
  activeLoans: apiGroup.active_loans,
  totalDisbursed: apiGroup.total_disbursed,
  createdAt: apiGroup.created_at
});

const convertApiTransactionToLocal = (apiTransaction: ApiTransaction): Transaction => ({
  id: apiTransaction.id,
  type: apiTransaction.type,
  amount: apiTransaction.amount,
  userId: apiTransaction.user_id,
  groupId: apiTransaction.group_id,
  description: apiTransaction.description,
  status: apiTransaction.status,
  createdAt: apiTransaction.created_at
});

const convertApiLoanToLocal = (apiLoan: ApiLoan): Loan => ({
  id: apiLoan.id,
  userId: apiLoan.user_id,
  groupId: apiLoan.group_id,
  amount: apiLoan.amount,
  repaidAmount: apiLoan.repaid_amount,
  interestRate: apiLoan.interest_rate,
  dueDate: apiLoan.due_date,
  status: apiLoan.status,
  type: apiLoan.type,
  createdAt: apiLoan.created_at
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    completedTransactions: 0,
    totalTransacted: 0,
    totalLoanDisbursed: 0,
    totalLoanRepaid: 0,
    totalEarned: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [usersResponse, groupsResponse, transactionsResponse, loansResponse, analyticsResponse] = await Promise.allSettled([
        UserService.getUsers({ limit: 1000 }),
        GroupService.getGroups({ limit: 1000 }),
        TransactionService.getTransactions({ limit: 1000 }),
        LoanService.getLoans({ limit: 1000 }),
        AnalyticsService.getDashboardAnalytics()
      ]);

      // Process users
      if (usersResponse.status === 'fulfilled') {
        const convertedUsers = usersResponse.value.items.map(convertApiUserToLocal);
        setUsers(convertedUsers);
      } else {
        console.error('Failed to load users:', usersResponse.reason);
      }

      // Process groups
      if (groupsResponse.status === 'fulfilled') {
        const convertedGroups = groupsResponse.value.items.map(convertApiGroupToLocal);
        setGroups(convertedGroups);
      } else {
        console.error('Failed to load groups:', groupsResponse.reason);
      }

      // Process transactions
      if (transactionsResponse.status === 'fulfilled') {
        const convertedTransactions = transactionsResponse.value.items.map(convertApiTransactionToLocal);
        setTransactions(convertedTransactions);
      } else {
        console.error('Failed to load transactions:', transactionsResponse.reason);
      }

      // Process loans
      if (loansResponse.status === 'fulfilled') {
        const convertedLoans = loansResponse.value.items.map(convertApiLoanToLocal);
        setLoans(convertedLoans);
      } else {
        console.error('Failed to load loans:', loansResponse.reason);
      }

      // Process analytics
      if (analyticsResponse.status === 'fulfilled') {
        const analytics = analyticsResponse.value;
        setStats({
          totalUsers: analytics.total_users,
          totalGroups: analytics.total_groups,
          completedTransactions: analytics.completed_transactions,
          totalTransacted: analytics.total_transacted,
          totalLoanDisbursed: analytics.total_loan_disbursed,
          totalLoanRepaid: analytics.total_loan_repaid,
          totalEarned: analytics.total_earned
        });
      } else {
        console.error('Failed to load analytics:', analyticsResponse.reason);
      }

    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const createRequest: CreateUserRequest = {
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        group_id: userData.groupId,
        balance: userData.balance
      };

      const newUser = await UserService.createUser(createRequest);
      const convertedUser = convertApiUserToLocal(newUser);
      setUsers(prev => [...prev, convertedUser]);
      
      // Refresh stats
      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create user';
      setError(errorMessage);
      throw err;
    }
  };

  const addGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    try {
      const createRequest: CreateGroupRequest = {
        name: groupData.name,
        reg_no: groupData.regNo,
        location: groupData.location,
        description: groupData.description,
        admin_id: groupData.adminId,
        loan_limit: groupData.loanLimit,
        interest_rate: groupData.interestRate || 5
      };

      const newGroup = await GroupService.createGroup(createRequest);
      const convertedGroup = convertApiGroupToLocal(newGroup);
      setGroups(prev => [...prev, convertedGroup]);
      
      // Refresh stats
      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create group';
      setError(errorMessage);
      throw err;
    }
  };

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      const updateRequest: UpdateGroupRequest = {
        name: updates.name,
        reg_no: updates.regNo,
        location: updates.location,
        description: updates.description,
        admin_id: updates.adminId,
        loan_limit: updates.loanLimit,
        interest_rate: updates.interestRate
      };

      const updatedGroup = await GroupService.updateGroup(id, updateRequest);
      const convertedGroup = convertApiGroupToLocal(updatedGroup);
      setGroups(prev => prev.map(group => 
        group.id === id ? convertedGroup : group
      ));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update group';
      setError(errorMessage);
      throw err;
    }
  };

  const updateGroupExecutives = async (groupId: string, executives: { secretary: string; chairperson: string; treasurer: string }) => {
    try {
      const updateRequest: UpdateExecutivesRequest = {
        secretary: executives.secretary,
        chairperson: executives.chairperson,
        treasurer: executives.treasurer
      };

      await GroupService.updateExecutives(groupId, updateRequest);
      
      // Update local state - reset all users' roles in this group to 'member'
      setUsers(prev => prev.map(user => 
        user.groupId === groupId && ['secretary', 'chairperson', 'treasurer'].includes(user.role)
          ? { ...user, role: 'member' as const }
          : user
      ));

      // Set new executive roles
      setUsers(prev => prev.map(user => {
        if (user.id === executives.secretary) return { ...user, role: 'secretary' as const };
        if (user.id === executives.chairperson) return { ...user, role: 'chairperson' as const };
        if (user.id === executives.treasurer) return { ...user, role: 'treasurer' as const };
        return user;
      }));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update executives';
      setError(errorMessage);
      throw err;
    }
  };

  const updateGroupLoanLimit = async (groupId: string, loanLimit: number) => {
    try {
      await GroupService.updateLoanLimit(groupId, { loan_limit: loanLimit });
      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, loanLimit } : group
      ));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update loan limit';
      setError(errorMessage);
      throw err;
    }
  };

  const updateGroupInterestRate = async (groupId: string, interestRate: number) => {
    try {
      await GroupService.updateInterestRate(groupId, { interest_rate: interestRate });
      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, interestRate } : group
      ));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update interest rate';
      setError(errorMessage);
      throw err;
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const createRequest: CreateTransactionRequest = {
        type: transactionData.type,
        amount: transactionData.amount,
        user_id: transactionData.userId,
        group_id: transactionData.groupId,
        description: transactionData.description
      };

      const newTransaction = await TransactionService.createTransaction(createRequest);
      const convertedTransaction = convertApiTransactionToLocal(newTransaction);
      setTransactions(prev => [...prev, convertedTransaction]);
      
      // Refresh stats
      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      throw err;
    }
  };

  const addLoan = async (loanData: Omit<Loan, 'id' | 'createdAt'>) => {
    try {
      const createRequest: CreateLoanRequest = {
        user_id: loanData.userId,
        group_id: loanData.groupId,
        amount: loanData.amount,
        interest_rate: loanData.interestRate,
        due_date: loanData.dueDate,
        type: loanData.type,
        purpose: 'Loan disbursement' // Default purpose
      };

      const newLoan = await LoanService.createLoan(createRequest);
      const convertedLoan = convertApiLoanToLocal(newLoan);
      setLoans(prev => [...prev, convertedLoan]);
      
      // Refresh stats
      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create loan';
      setError(errorMessage);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updateRequest: UpdateUserRequest = {
        name: updates.name,
        phone: updates.phone,
        role: updates.role,
        group_id: updates.groupId,
        balance: updates.balance,
        status: updates.status
      };

      const updatedUser = await UserService.updateUser(id, updateRequest);
      const convertedUser = convertApiUserToLocal(updatedUser);
      setUsers(prev => prev.map(user => 
        user.id === id ? convertedUser : user
      ));
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    }
  };

  const resetUserPin = async (userId: string) => {
    try {
      const result = await UserService.resetUserPin(userId);
      return {
        newPin: result.new_pin,
        smsSent: result.sms_sent
      };
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to reset PIN';
      setError(errorMessage);
      throw err;
    }
  };

  const refreshStats = async () => {
    try {
      const analytics = await AnalyticsService.getDashboardAnalytics();
      setStats({
        totalUsers: analytics.total_users,
        totalGroups: analytics.total_groups,
        completedTransactions: analytics.completed_transactions,
        totalTransacted: analytics.total_transacted,
        totalLoanDisbursed: analytics.total_loan_disbursed,
        totalLoanRepaid: analytics.total_loan_repaid,
        totalEarned: analytics.total_earned
      });
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider value={{
      users,
      groups,
      transactions,
      loans,
      stats,
      loading,
      error,
      addUser,
      addGroup,
      updateGroup,
      updateGroupExecutives,
      updateGroupLoanLimit,
      updateGroupInterestRate,
      addTransaction,
      addLoan,
      updateUser,
      resetUserPin,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};