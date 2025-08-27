import React, { useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, Building2Icon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { useBanks } from '../../hooks/useBank';

interface BankFormData {
  name: string;
  code: string;
  branch: string;
}

export const BankManagement = (): JSX.Element => {
  const { banks, loading, error, createBank, updateBank, deleteBank } = useBanks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [formData, setFormData] = useState<BankFormData>({
    name: '',
    code: '',
    branch: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await updateBank(editingBank, formData);
      } else {
        await createBank(formData);
      }
      
      // Reset form and close dialog
      setFormData({ name: '', code: '', branch: '' });
      setEditingBank(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving bank:', error);
    }
  };

  const handleEdit = (bank: any) => {
    setFormData({
      name: bank.name,
      code: bank.code || '',
      branch: bank.branch || '',
    });
    setEditingBank(bank.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bank?')) {
      try {
        await deleteBank(id);
      } catch (error) {
        console.error('Error deleting bank:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', branch: '' });
    setEditingBank(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <header className="w-full h-[73px] bg-black rounded-b-[47px] flex items-center justify-center relative">
          <h1 className="text-white text-xl font-semibold">Bank Management</h1>
        </header>

        <div className="p-4 space-y-4">
          {/* Add Bank Button */}
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-gray-800 text-lg font-medium">Manage Banks</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="h-10 bg-black rounded-full px-4"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingBank ? 'Edit Bank' : 'Add New Bank'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBank 
                      ? 'Update the bank information below.'
                      : 'Enter the details for the new bank.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Bank Name *"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-[#f7f6fc] border-[#e0e1e3] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Bank Code (Optional)"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="bg-[#f7f6fc] border-[#e0e1e3] rounded-lg"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Branch Name (Optional)"
                      value={formData.branch}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                      className="bg-[#f7f6fc] border-[#e0e1e3] rounded-lg"
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !formData.name.trim()}
                      className="bg-black text-white"
                    >
                      {loading 
                        ? (editingBank ? 'Updating...' : 'Adding...') 
                        : (editingBank ? 'Update' : 'Add')
                      }
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Banks List */}
          {loading && banks.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading banks...</div>
            </div>
          ) : banks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No banks found. Add your first bank to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banks.map((bank) => (
                <Card key={bank.id} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Building2Icon className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900">{bank.name}</h3>
                          {bank.code && (
                            <p className="text-sm text-gray-600">Code: {bank.code}</p>
                          )}
                          {bank.branch && (
                            <p className="text-sm text-gray-600">Branch: {bank.branch}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Added: {new Date(bank.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(bank)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(bank.id)}
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {banks.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4">
              {banks.length} bank{banks.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};