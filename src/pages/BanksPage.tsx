import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit, Trash2 } from 'lucide-react';
import { supabase, Bank } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import toast from 'react-hot-toast';

export const BanksPage: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBankName, setNewBankName] = useState('');

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('bank_name');

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBank = async () => {
    if (!newBankName.trim()) {
      toast.error('Bank name is required');
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('banks')
        .insert([{ bank_name: newBankName.trim() }]);

      if (error) throw error;

      toast.success('Bank added successfully');
      setNewBankName('');
      fetchBanks();
    } catch (error: any) {
      console.error('Error adding bank:', error);
      if (error.code === '23505') {
        toast.error('Bank name already exists');
      } else {
        toast.error('Failed to add bank');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBank = async (id: string, bankName: string) => {
    if (!confirm(`Are you sure you want to delete "${bankName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('banks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Bank deleted successfully');
      fetchBanks();
    } catch (error) {
      console.error('Error deleting bank:', error);
      toast.error('Failed to delete bank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading banks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Bank Management</h1>
            </div>
          </div>

          {/* Add New Bank */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Bank</h2>
            <div className="flex gap-4">
              <Input
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="Enter bank name"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddBank()}
              />
              <Button
                onClick={handleAddBank}
                disabled={isAdding || !newBankName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bank
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Banks List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Banks ({banks.length})
            </h2>
            
            {banks.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No banks found</p>
                <p className="text-gray-400">Add your first bank to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{bank.bank_name}</h3>
                        <p className="text-sm text-gray-500">
                          Added {new Date(bank.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBank(bank.id, bank.bank_name)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};