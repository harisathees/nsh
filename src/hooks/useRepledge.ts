import { useState, useEffect } from 'react';
import { supabase, type Loan, type Jewel, type RepledgeEntry } from '../lib/supabase';

export const useRepledge = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repledgeEntries, setRepledgeEntries] = useState<RepledgeEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Fetch loan details by loan number
  const fetchLoanDetails = async (loanNo: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch loan details
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('loan_no', loanNo)
        .limit(1);

      if (loanError) {
        throw new Error('Loan not found');
      }

      if (!loanData || loanData.length === 0) {
        throw new Error('Loan not found');
      }

      const loan = loanData[0];

      // Fetch jewel details for the loan
      const { data: jewelData, error: jewelError } = await supabase
        .from('jewels')
        .select('*')
        .eq('loan_id', loan.id);

      if (jewelError) {
        throw new Error('Error fetching jewel details');
      }

      // Calculate total weights from jewels
      const totalNetWeight = jewelData.reduce((sum, jewel) => sum + (jewel.net_weight || 0), 0);
      const totalGrossWeight = jewelData.reduce((sum, jewel) => sum + (jewel.weight || 0), 0);
      const totalStoneWeight = jewelData.reduce((sum, jewel) => sum + (jewel.stone_weight || 0), 0);

      return {
        loan: loan as Loan,
        jewels: jewelData as Jewel[],
        totals: {
          net_weight: totalNetWeight,
          gross_weight: totalGrossWeight,
          stone_weight: totalStoneWeight,
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch repledge entries with pagination
  const fetchRepledgeEntries = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('repledge_entries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setRepledgeEntries(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching entries');
    } finally {
      setLoading(false);
    }
  };

  // Save repledge entry
  const saveRepledgeEntry = async (entryData: Omit<RepledgeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('repledge_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;

      // Refresh the entries list
      await fetchRepledgeEntries(currentPage);
      
      return data as RepledgeEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving entry');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update repledge entry
  const updateRepledgeEntry = async (id: string, entryData: Partial<RepledgeEntry>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('repledge_entries')
        .update({ ...entryData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refresh the entries list
      await fetchRepledgeEntries(currentPage);
      
      return data as RepledgeEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating entry');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete repledge entry
  const deleteRepledgeEntry = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('repledge_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the entries list
      await fetchRepledgeEntries(currentPage);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting entry');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Search loan suggestions
  const searchLoanSuggestions = async (query: string) => {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('loans')
        .select('loan_no, amount, status')
        .ilike('loan_no', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchRepledgeEntries();
  }, [currentPage]);

  return {
    loading,
    error,
    repledgeEntries,
    currentPage,
    totalPages,
    fetchLoanDetails,
    fetchRepledgeEntries,
    saveRepledgeEntry,
    updateRepledgeEntry,
    deleteRepledgeEntry,
    searchLoanSuggestions,
    setCurrentPage,
  };
};