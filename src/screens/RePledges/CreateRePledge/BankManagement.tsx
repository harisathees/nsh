import React, { useState, useMemo } from 'react';
import { PlusIcon, EditIcon, TrashIcon, Building2Icon, SearchIcon, InfoIcon, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label'; // --- 1. IMPORT Label ---
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { useBanks } from '../../../hooks/useBank';
import toast from 'react-hot-toast';
import { cn } from '../../../lib/utils'; // Helper for conditional classes

// --- TYPES ---
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
}

interface BankFormData {
  name: string;
  code: string;
  branch: string;
  defaultInterest: string;
  validityMonths: string;
  postValidityInterest: string;
  paymentMethod: string;
}

const initialFormData: BankFormData = {
  name: '',
  code: '',
  branch: '',
  defaultInterest: '',
  validityMonths: '',
  postValidityInterest: '',
  paymentMethod: '',
};

// --- HELPER COMPONENTS ---

// 2. A more visually appealing Bank List Item
const BankListItem = ({ bank, onEdit, onDelete }: { bank: Bank, onEdit: () => void, onDelete: () => void }) => (
  <Card className="transition-all duration-200 ease-in-out hover:shadow-md hover:border-slate-300">
    <CardContent className="p-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-100 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <Building2Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-slate-800">{bank.name}</h3>
            {bank.branch && <p className="text-sm text-slate-500">{bank.branch}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {bank.default_interest && (
              <InfoBadge label="Interest" value={`${bank.default_interest}% for ${bank.validity_months}m`} />
            )}
            {bank.code && <InfoBadge label="Code" value={bank.code} />}
            {bank.payment_method && <InfoBadge label="Payment" value={bank.payment_method} />}
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button onClick={onEdit} size="sm" variant="outline" className="h-8 w-8 p-0">
          <EditIcon className="w-4 h-4" />
        </Button>
        <Button onClick={onDelete} size="sm" variant="destructive" className="h-8 w-8 p-0">
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

// 3. A reusable badge for displaying info
const InfoBadge = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-2.5 py-1 text-xs">
    <span className="font-medium text-slate-600">{label}:</span>
    <span className="text-slate-800">{value}</span>
  </div>
);

// 4. A reusable Empty State component
const EmptyState = ({ icon: Icon, title, message }: { icon: React.ElementType, title: string, message: string }) => (
    <div className="text-center py-12 text-slate-500">
        <Icon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        <p>{message}</p>
    </div>
);


// --- MAIN COMPONENT ---
export const BankManagement = (): JSX.Element => {
  const { banks, loading, error, createBank, updateBank, deleteBank } = useBanks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [formData, setFormData] = useState<BankFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return banks;
    return banks.filter(bank =>
      bank.name.toLowerCase().includes(query) ||
      bank.code?.toLowerCase().includes(query) ||
      bank.branch?.toLowerCase().includes(query)
    );
  }, [banks, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = editingBank
      ? updateBank(editingBank, formData)
      : createBank(formData);

    toast.promise(promise, {
      loading: 'Saving bank...',
      success: `Bank ${editingBank ? 'updated' : 'added'} successfully!`,
      error: (err) => err.message || 'Failed to save bank.'
    });

    try {
      await promise;
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving bank:', err);
    }
  };

  const handleEdit = (bank: Bank) => {
    setFormData({
      name: bank.name || '',
      code: bank.code || '',
      branch: bank.branch || '',
      defaultInterest: bank.default_interest?.toString() || '',
      validityMonths: bank.validity_months?.toString() || '',
      postValidityInterest: bank.post_validity_interest?.toString() || '',
      paymentMethod: bank.payment_method || '',
    });
    setEditingBank(bank.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Using a native confirm is okay, but a custom modal would be a nice future enhancement
    if (confirm('Are you sure you want to delete this bank?')) {
      const promise = deleteBank(id);
      toast.promise(promise, {
        loading: 'Deleting bank...',
        success: 'Bank deleted successfully!',
        error: (err) => err.message || 'Failed to delete bank.'
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingBank(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  const renderContent = () => {
    if (loading && banks.length === 0) {
      return (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      );
    }
    if (banks.length === 0) {
      return (
        <EmptyState 
          icon={Building2Icon}
          title="No Banks Found"
          message="Add your first bank to get started."
        />
      );
    }
    if (filteredBanks.length === 0) {
        return (
            <EmptyState
                icon={SearchIcon}
                title="No Matches"
                message="No banks match your search criteria."
            />
        );
    }
    return (
      <div className="space-y-3">
        {filteredBanks.map((bank) => (
          <BankListItem
            key={bank.id}
            bank={bank}
            onEdit={() => handleEdit(bank)}
            onDelete={() => handleDelete(bank.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto">
        {/* --- 5. A proper, distinct header --- */}
        <header className="w-full h-20 bg-gradient-to-r from-slate-900 to-slate-800 rounded-b-3xl flex items-center justify-between px-6 mb-6 shadow-lg">
    <h1 className="text-white text-xl font-bold">
      Bank Management
    </h1>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Bank
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingBank ? 'Edit Bank' : 'Add New Bank'}</DialogTitle>
                        <DialogDescription>
                            {editingBank ? 'Update the bank information below.' : 'Enter the details for the new bank.'}
                        </DialogDescription>
                    </DialogHeader>
                    {/* --- 6. Form now uses Labels for better UX/A11y --- */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bank Name *</Label>
                            <Input id="name" placeholder="e.g., State Bank of India" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Bank Code</Label>
                                <Input id="code" placeholder="e.g., SBI001" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch">Branch Name</Label>
                                <Input id="branch" placeholder="e.g., Main Street Branch" value={formData.branch} onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="defaultInterest">Interest %</Label>
                                <Input id="defaultInterest" type="number" placeholder="e.g., 12" value={formData.defaultInterest} onChange={(e) => setFormData(prev => ({ ...prev, defaultInterest: e.target.value }))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="validityMonths">Validity (Months)</Label>
                                <Input id="validityMonths" type="number" placeholder="e.g., 6" value={formData.validityMonths} onChange={(e) => setFormData(prev => ({ ...prev, validityMonths: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postValidityInterest">Interest % (After Validity)</Label>
                            <Input id="postValidityInterest" type="number" placeholder="e.g., 18" value={formData.postValidityInterest} onChange={(e) => setFormData(prev => ({ ...prev, postValidityInterest: e.target.value }))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Default Payment Method</Label>
                            <Input id="paymentMethod" placeholder="e.g., Online Transfer" value={formData.paymentMethod} onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading || !formData.name.trim()}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingBank ? 'Update Bank' : 'Add Bank')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </header>

        <main className="px-4 pb-8 space-y-4">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    placeholder="Search by name, code, or branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>

            {renderContent()}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};