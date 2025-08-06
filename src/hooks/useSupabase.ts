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
  activeLoans: number
  totalAmountLoaned: number
  closedLoans: number
  overdueLoans: number
  interestEarned: number
  pendingPayments: number
  goldRate: number
  silverRate: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    activeLoans: 0,
    totalAmountLoaned: 0,
    closedLoans: 0,
    overdueLoans: 0,
    interestEarned: 0,
    pendingPayments: 0,
    goldRate: 9002,
    silverRate: 129
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')

      if (error) throw error

      const activeLoans = loans?.filter(loan => loan.status === 'Active').length || 0
      const closedLoans = loans?.filter(loan => loan.status === 'Closed').length || 0
      const overdueLoans = loans?.filter(loan => loan.status === 'Overdue').length || 0
      
      const totalAmountLoaned = loans?.reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0
      const interestEarned = loans?.reduce((sum, loan) => {
        const rate = loan.interest_rate || 0
        const amount = loan.amount || 0
        return sum + (amount * rate / 100)
      }, 0) || 0
      
      const pendingPayments = loans?.filter(loan => loan.status === 'Active')
        .reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0

      setStats({
        activeLoans,
        totalAmountLoaned,
        closedLoans,
        overdueLoans,
        interestEarned,
        pendingPayments,
        goldRate: 9002,
        silverRate: 129
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('loans-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { stats, loading, refetch: fetchStats }
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