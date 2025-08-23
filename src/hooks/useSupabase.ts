import { useEffect, useState } from 'react';
import { supabase, type Customer, type Loan, type Jewel } from '../lib/supabase';

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          customer:customers!fk_loans_customer_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('loans_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loans' },
        () => fetchLoans()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { loans, loading, error, refetch: fetchLoans };
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { customers, loading, createCustomer, updateCustomer };
};

export const useJewels = (loanId?: string) => {
  const [jewels, setJewels] = useState<Jewel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJewels = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jewels')
        .select('*')
        .eq('loan_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setJewels(data || []);
    } catch (err) {
      console.error('Error fetching jewels:', err);
    } finally {
      setLoading(false);
    }
  };

  const createJewel = async (jewelData: Omit<Jewel, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('jewels')
      .insert([jewelData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateJewel = async (id: string, jewelData: Partial<Jewel>) => {
    const { data, error } = await supabase
      .from('jewels')
      .update({ ...jewelData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteJewel = async (id: string) => {
    const { error } = await supabase
      .from('jewels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  useEffect(() => {
    if (loanId) {
      fetchJewels(loanId);
    }
  }, [loanId]);

  return { jewels, loading, createJewel, updateJewel, deleteJewel, refetch: fetchJewels };
};





//for dashboard


export interface DashboardStats {
  // Loan Counts
  totalLoansCount: number;
  activeLoansCount: number;
  closedLoansCount: number;
  overdueLoansCount: number;

  // Principal Amounts
  totalPrincipal: number;
  activePrincipal: number;
  closedPrincipal: number;
  overduePrincipal: number;

  // Interest Amounts (this is a simplified calculation, adjust as needed)
  totalInterest: number;
  collectedInterest: number; // Assuming interest from closed loans is collected
  pendingInterest: number;   // Assuming interest from active loans is pending
  overdueInterest: number;   // Assuming interest from overdue loans is overdue
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLoansCount: 0,
    activeLoansCount: 0,
    closedLoansCount: 0,
    overdueLoansCount: 0,
    totalPrincipal: 0,
    activePrincipal: 0,
    closedPrincipal: 0,
    overduePrincipal: 0,
    totalInterest: 0,
    collectedInterest: 0,
    pendingInterest: 0,
    overdueInterest: 0,
  });
  const [loading, setLoading] = useState(true);

  // TODO: Implement date filtering logic here based on a time period state
  // For example: const [timePeriod, setTimePeriod] = useState('Month');
  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*');

      if (error) throw error;
      if (!loans) return;

      // Filter loans by status
      const activeLoans = loans.filter(loan => loan.status === 'Active');
      const closedLoans = loans.filter(loan => loan.status === 'Closed');
      const overdueLoans = loans.filter(loan => loan.status === 'Overdue');
      
      // Helper function to calculate interest for a loan
      const calculateInterest = (loan: any) => (loan.amount || 0) * (loan.interest_rate || 0) / 100;

      // Calculate all stats
      const newStats: DashboardStats = {
        totalLoansCount: loans.length,
        activeLoansCount: activeLoans.length,
        closedLoansCount: closedLoans.length,
        overdueLoansCount: overdueLoans.length,
        
        totalPrincipal: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
        activePrincipal: activeLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
        closedPrincipal: closedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
        overduePrincipal: overdueLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
        
        collectedInterest: closedLoans.reduce((sum, loan) => sum + calculateInterest(loan), 0),
        pendingInterest: activeLoans.reduce((sum, loan) => sum + calculateInterest(loan), 0),
        overdueInterest: overdueLoans.reduce((sum, loan) => sum + calculateInterest(loan), 0),
        totalInterest: 0 // This will be calculated below
      };
      
      newStats.totalInterest = newStats.collectedInterest + newStats.pendingInterest;

      setStats(newStats);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('loans-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loans' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // TODO: Add timePeriod to dependency array when implemented

  return { stats, loading, refetch: fetchStats };
}

export function useRecentLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setLoans(data || [])
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('recent-loans-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchLoans()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { loans, loading, refetch: fetchLoans }
}