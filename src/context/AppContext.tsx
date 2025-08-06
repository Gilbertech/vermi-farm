import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { usersApi, groupsApi, transactionsApi, loansApi, analyticsApi } from '../services/api';

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
  isLoading: boolean;
  error: string | null;
  stats: {
    totalUsers: number;
    totalGroups: number;
    completedTransactions: number;
    totalTransacted: number;
    totalLoanDisbursed: number;
    totalLoanRepaid: number;
    totalEarned: number;
  };
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  updateGroupExecutives: (groupId: string, executives: { secretary: string; chairperson: string; treasurer: string }) => void;
  updateGroupLoanLimit: (groupId: string, loanLimit: number) => void;
  updateGroupInterestRate: (groupId: string, interestRate: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  resetUserPin: (userId: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    users, 
    groups, 
    transactions, 
    loans, 
    isLoading, 
    error,
    setUsers,
    setGroups,
    setTransactions,
    setLoans
  } = useRealTimeData();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    completedTransactions: 0,
    totalTransacted: 0,
    totalLoanDisbursed: 0,
    totalLoanRepaid: 0,
    totalEarned: 0
  });

  // Update stats when data changes
  useEffect(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalTransacted = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalLoanDisbursed = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalLoanRepaid = loans.reduce((sum, l) => sum + l.repaid_amount, 0);
    const totalEarned = loans.reduce((sum, l) => sum + (l.amount * l.interest_rate / 100), 0);

    setStats({
      totalUsers: users.length,
      totalGroups: groups.length,
      completedTransactions: completedTransactions.length,
      totalTransacted,
      totalLoanDisbursed,
      totalLoanRepaid,
      totalEarned
    });
  }, []);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const response = await usersApi.createUser({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        group_id: userData.groupId,
        balance: userData.balance,
        status: userData.status
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const addGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    try {
      const response = await groupsApi.createGroup({
        name: groupData.name,
        reg_no: groupData.regNo,
        location: groupData.location,
        description: groupData.description,
        admin_id: groupData.adminId,
        total_balance: groupData.totalBalance,
        loan_limit: groupData.loanLimit,
        interest_rate: groupData.interestRate
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Failed to add group. Please try again.');
    }
  };

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      const response = await groupsApi.updateGroup(id, {
        name: updates.name,
        reg_no: updates.regNo,
        location: updates.location,
        description: updates.description
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group. Please try again.');
    }
  };

  const updateGroupExecutives = async (groupId: string, executives: { secretary: string; chairperson: string; treasurer: string }) => {
    try {
      const response = await groupsApi.updateExecutives(groupId, executives);

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error updating executives:', error);
      alert('Failed to update executives. Please try again.');
    }
  };

  const updateGroupLoanLimit = async (groupId: string, loanLimit: number) => {
    try {
      const response = await groupsApi.updateGroup(groupId, { loan_limit: loanLimit });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error updating loan limit:', error);
      alert('Failed to update loan limit. Please try again.');
    }
  };

  const updateGroupInterestRate = async (groupId: string, interestRate: number) => {
    try {
      const response = await groupsApi.updateGroup(groupId, { interest_rate: interestRate });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error updating interest rate:', error);
      alert('Failed to update interest rate. Please try again.');
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await transactionsApi.createTransaction({
        tx_code: `TXN${Date.now()}`,
        type: transactionData.type,
        amount: transactionData.amount,
        fees: 0,
        user_id: transactionData.userId,
        group_id: transactionData.groupId,
        from_account: transactionData.userId,
        to_account: transactionData.groupId || 'system',
        description: transactionData.description,
        status: transactionData.status
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const addLoan = async (loanData: Omit<Loan, 'id' | 'createdAt'>) => {
    try {
      const response = await loansApi.createLoan({
        user_id: loanData.userId,
        group_id: loanData.groupId,
        amount: loanData.amount,
        repaid_amount: loanData.repaidAmount,
        interest_rate: loanData.interestRate,
        due_date: loanData.dueDate,
        status: loanData.status,
        type: loanData.type,
        purpose: (loanData as any).purpose
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error adding loan:', error);
      alert('Failed to add loan. Please try again.');
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await usersApi.updateUser(id, {
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        role: updates.role,
        group_id: updates.groupId,
        balance: updates.balance,
        status: updates.status
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const resetUserPin = async (userId: string) => {
    try {
      const response = await usersApi.resetUserPin(userId);

      if (!response.success) {
        throw new Error(response.error);
      }

      alert(`PIN reset successfully! New PIN: ${response.data?.new_pin}`);
    } catch (error) {
      console.error('Error resetting PIN:', error);
      alert('Failed to reset PIN. Please try again.');
    }
  };

  const refreshData = async () => {
    try {
      // Refresh all data from the database
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      users,
      groups,
      transactions,
      loans,
      isLoading,
      error,
      stats,
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