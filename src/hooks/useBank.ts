import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

interface Bank {
  id: string;
  name: string;
  code?: string;
  branch?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface CreateBankData {
  name: string;
  code?: string;
  branch?: string;
}

export const useBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all banks
  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      setBanks(data || []);
    } catch (err) {
      console.error('Error fetching banks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch banks');
    } finally {
      setLoading(false);
    }
  };

  // Create new bank
  const createBank = async (bankData: CreateBankData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('banks')
        .insert([
          {
            ...bankData,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setBanks(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error creating bank:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bank');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update bank
  const updateBank = async (id: string, updates: Partial<CreateBankData>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('banks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBanks(prev => 
        prev.map(bank => bank.id === id ? data : bank)
           .sort((a, b) => a.name.localeCompare(b.name))
      );
      return data;
    } catch (err) {
      console.error('Error updating bank:', err);
      setError(err instanceof Error ? err.message : 'Failed to update bank');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete bank (soft delete)
  const deleteBank = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('banks')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setBanks(prev => prev.filter(bank => bank.id !== id));
    } catch (err) {
      console.error('Error deleting bank:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete bank');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search banks
  const searchBanks = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,branch.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error searching banks:', err);
      return [];
    }
  };

  // Load banks on hook initialization
  useEffect(() => {
    fetchBanks();
  }, []);

  return {
    banks,
    loading,
    error,
    fetchBanks,
    createBank,
    updateBank,
    deleteBank,
    searchBanks,
  };
};