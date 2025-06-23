import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'member' | 'secretary' | 'chairperson' | 'treasurer';
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
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  // Initialize with sample data
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254712345678',
        role: 'admin',
        groupId: '1',
        balance: 5000,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+254787654321',
        role: 'secretary',
        groupId: '1',
        balance: 3500,
        status: 'active',
        createdAt: '2024-01-16T14:30:00Z'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+254798765432',
        role: 'chairperson',
        groupId: '2',
        balance: 7200,
        status: 'active',
        createdAt: '2024-01-17T09:15:00Z'
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+254756789123',
        role: 'treasurer',
        groupId: '1',
        balance: 4200,
        status: 'active',
        createdAt: '2024-01-18T11:20:00Z'
      }
    ];

    const sampleGroups: Group[] = [
      {
        id: '1',
        name: 'Nairobi Farmers',
        regNo: 'NF001',
        location: 'Nairobi, Kenya',
        description: 'Urban farming group in Nairobi focusing on sustainable agriculture',
        adminId: '1',
        members: ['1', '2', '4'],
        totalBalance: 12700,
        loanLimit: 50000,
        interestRate: 5,
        activeLoans: 2,
        totalDisbursed: 25000,
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        name: 'Mombasa Collective',
        regNo: 'MC002',
        location: 'Mombasa, Kenya',
        description: 'Coastal farming cooperative specializing in coconut and cashew farming',
        adminId: '3',
        members: ['3'],
        totalBalance: 7200,
        loanLimit: 75000,
        interestRate: 4.5,
        activeLoans: 1,
        totalDisbursed: 15000,
        createdAt: '2024-01-17T08:00:00Z'
      }
    ];

    const sampleTransactions: Transaction[] = [
      {
        id: '1',
        type: 'deposit',
        amount: 2000,
        userId: '1',
        groupId: '1',
        description: 'Monthly contribution',
        status: 'completed',
        createdAt: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        type: 'loan',
        amount: 15000,
        userId: '2',
        groupId: '1',
        description: 'Equipment purchase loan',
        status: 'completed',
        createdAt: '2024-01-22T14:00:00Z'
      }
    ];

    const sampleLoans: Loan[] = [
      {
        id: '1',
        userId: '2',
        groupId: '1',
        amount: 15000,
        repaidAmount: 3000,
        interestRate: 5,
        dueDate: '2024-07-22T00:00:00Z',
        status: 'active',
        createdAt: '2024-01-22T14:00:00Z'
      }
    ];

    setUsers(sampleUsers);
    setGroups(sampleGroups);
    setTransactions(sampleTransactions);
    setLoans(sampleLoans);
  }, []);

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ));
  };

  const updateGroupExecutives = (groupId: string, executives: { secretary: string; chairperson: string; treasurer: string }) => {
    // Reset all users' roles in this group to 'member'
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
  };

  const updateGroupLoanLimit = (groupId: string, loanLimit: number) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, loanLimit } : group
    ));
  };

  const updateGroupInterestRate = (groupId: string, interestRate: number) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, interestRate } : group
    ));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const resetUserPin = (userId: string) => {
    // In a real app, this would make an API call
    console.log(`PIN reset for user ${userId}`);
  };

  const stats = {
    totalUsers: users.length,
    totalGroups: groups.length,
    completedTransactions: transactions.filter(t => t.status === 'completed').length,
    totalTransacted: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalLoanDisbursed: loans.reduce((sum, l) => sum + l.amount, 0),
    totalLoanRepaid: loans.reduce((sum, l) => sum + l.repaidAmount, 0),
    totalEarned: loans.reduce((sum, l) => sum + (l.amount * l.interestRate / 100), 0)
  };

  return (
    <AppContext.Provider value={{
      users,
      groups,
      transactions,
      loans,
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
      resetUserPin
    }}>
      {children}
    </AppContext.Provider>
  );
};