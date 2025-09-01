import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

// ## Interfaces remain the same
interface Bank {
  id: string;
  name: string;
  code?: string;
  branch?: string;
  default_interest?: number;
  validity_months?: number;
  post_validity_interest?: number;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface BankFormData {
  name: string;
  code?: string;
  branch?: string;
  defaultInterest?: string;
  validityMonths?: string;
  postValidityInterest?: string;
  paymentMethod?: string;
}

export const useBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all banks (only active ones)
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

  // createBank function is unchanged
  const createBank = async (bankData: BankFormData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToInsert = {
        name: bankData.name,
        code: bankData.code || null,
        branch: bankData.branch || null,
        payment_method: bankData.paymentMethod || null,
        default_interest: bankData.defaultInterest ? parseFloat(bankData.defaultInterest) : null,
        validity_months: bankData.validityMonths ? parseInt(bankData.validityMonths, 10) : null,
        post_validity_interest: bankData.postValidityInterest ? parseFloat(bankData.postValidityInterest) : null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('banks')
        .insert([dataToInsert])
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
  
  // updateBank function is unchanged
  const updateBank = async (id: string, updates: Partial<BankFormData>) => {
    try {
      setLoading(true);
      setError(null);

      const dataToUpdate: { [key: string]: any } = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name !== undefined) dataToUpdate.name = updates.name;
      if (updates.code !== undefined) dataToUpdate.code = updates.code;
      if (updates.branch !== undefined) dataToUpdate.branch = updates.branch;
      if (updates.paymentMethod !== undefined) dataToUpdate.payment_method = updates.paymentMethod;

      if (updates.defaultInterest !== undefined) {
        dataToUpdate.default_interest = updates.defaultInterest ? parseFloat(updates.defaultInterest) : null;
      }
      if (updates.validityMonths !== undefined) {
        dataToUpdate.validity_months = updates.validityMonths ? parseInt(updates.validityMonths, 10) : null;
      }
      if (updates.postValidityInterest !== undefined) {
        dataToUpdate.post_validity_interest = updates.postValidityInterest ? parseFloat(updates.postValidityInterest) : null;
      }

      const { data, error } = await supabase
        .from('banks')
        .update(dataToUpdate)
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
  
  // --- THIS IS THE MODIFIED FUNCTION ---
  // It now performs a permanent hard delete.
  const deleteBank = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Changed from .update() to .delete() for permanent removal
      const { error } = await supabase
        .from('banks')
        .delete() 
        .eq('id', id);

      if (error) throw error;

      // Update the UI by filtering out the deleted bank
      setBanks(prev => prev.filter(bank => bank.id !== id));
    } catch (err) {
      console.error('Error deleting bank:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete bank');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // searchBanks function is unchanged
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