import { useEffect, useState } from 'react';
import { supabase, subscriptions } from '../services/api';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Group = Tables['groups']['Row'];
type Transaction = Tables['transactions']['Row'];
type Loan = Tables['loans']['Row'];

export const useRealTimeData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        const [usersResponse, groupsResponse, transactionsResponse, loansResponse] = await Promise.all([
          supabase.from('users').select('*').order('created_at', { ascending: false }),
          supabase.from('groups').select('*').order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('loans').select('*').order('created_at', { ascending: false })
        ]);

        if (usersResponse.error) throw usersResponse.error;
        if (groupsResponse.error) throw groupsResponse.error;
        if (transactionsResponse.error) throw transactionsResponse.error;
        if (loansResponse.error) throw loansResponse.error;

        setUsers(usersResponse.data || []);
        setGroups(groupsResponse.data || []);
        setTransactions(transactionsResponse.data || []);
        setLoans(loansResponse.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data');
        
        // Fallback to mock data if database fails
        loadMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const channels = [
      subscriptions.subscribeToUsers((payload) => {
        console.log('Users change:', payload);
        if (payload.eventType === 'INSERT') {
          setUsers(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setUsers(prev => prev.map(user => 
            user.id === payload.new.id ? payload.new : user
          ));
        } else if (payload.eventType === 'DELETE') {
          setUsers(prev => prev.filter(user => user.id !== payload.old.id));
        }
      }),

      subscriptions.subscribeToGroups((payload) => {
        console.log('Groups change:', payload);
        if (payload.eventType === 'INSERT') {
          setGroups(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setGroups(prev => prev.map(group => 
            group.id === payload.new.id ? payload.new : group
          ));
        } else if (payload.eventType === 'DELETE') {
          setGroups(prev => prev.filter(group => group.id !== payload.old.id));
        }
      }),

      subscriptions.subscribeToTransactions((payload) => {
        console.log('Transactions change:', payload);
        if (payload.eventType === 'INSERT') {
          setTransactions(prev => [payload.new, ...prev.slice(0, 99)]); // Keep last 100
        } else if (payload.eventType === 'UPDATE') {
          setTransactions(prev => prev.map(transaction => 
            transaction.id === payload.new.id ? payload.new : transaction
          ));
        }
      }),

      subscriptions.subscribeToLoans((payload) => {
        console.log('Loans change:', payload);
        if (payload.eventType === 'INSERT') {
          setLoans(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLoans(prev => prev.map(loan => 
            loan.id === payload.new.id ? payload.new : loan
          ));
        } else if (payload.eventType === 'DELETE') {
          setLoans(prev => prev.filter(loan => loan.id !== payload.old.id));
        }
      })
    ];

    // Cleanup subscriptions
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const loadMockData = () => {
    // Fallback mock data when database is not available
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0712345678',
        role: 'chairperson',
        group_id: '1',
        balance: 5000,
        status: 'active',
        pin: '1234',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0787654321',
        role: 'secretary',
        group_id: '1',
        balance: 3500,
        status: 'active',
        pin: '5678',
        created_at: '2024-01-16T14:30:00Z',
        updated_at: '2024-01-16T14:30:00Z'
      }
    ];

    const mockGroups: Group[] = [
      {
        id: '1',
        name: 'Nairobi Farmers',
        reg_no: 'NF001',
        location: 'Nairobi, Kenya',
        description: 'Urban farming group in Nairobi focusing on sustainable agriculture',
        admin_id: '1',
        total_balance: 12700,
        loan_limit: 50000,
        interest_rate: 5,
        active_loans: 2,
        total_disbursed: 25000,
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        tx_code: 'TXN001234567',
        type: 'deposit',
        amount: 2000,
        fees: 25,
        user_id: '1',
        group_id: '1',
        from_account: 'John Doe',
        to_account: 'Nairobi Farmers',
        description: 'Monthly contribution',
        status: 'completed',
        mpesa_receipt: 'QGH7K8L9M0',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];

    const mockLoans: Loan[] = [
      {
        id: '1',
        user_id: '2',
        group_id: '1',
        amount: 15000,
        repaid_amount: 3000,
        interest_rate: 5,
        due_date: '2024-07-22T00:00:00Z',
        status: 'active',
        type: 'group',
        purpose: 'Equipment purchase',
        created_at: '2024-01-22T14:00:00Z',
        updated_at: '2024-01-22T14:00:00Z'
      }
    ];

    setUsers(mockUsers);
    setGroups(mockGroups);
    setTransactions(mockTransactions);
    setLoans(mockLoans);
  };

  return {
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
  };
};