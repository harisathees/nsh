import React, { useState } from 'react';
import { supabase } from '../../lib/supabase'; // Adjust path to your supabase client

interface AddEntryModalProps {
  cashLogId: string;
  onClose: () => void;
  onSuccess: (newTransaction: any) => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ cashLogId, onClose, onSuccess }) => {
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !amount || !cashLogId) {
      setError('Purpose and amount are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const transactionData = {
      cash_log_id: cashLogId,
      purpose,
      amount_in: type === 'in' ? Number(amount) : null,
      amount_out: type === 'out' ? Number(amount) : null,
    };

    const { data, error: insertError } = await supabase
      .from('cash_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (insertError) {
      console.error('Error adding transaction:', insertError);
      setError('Failed to add entry. Please try again.');
      setIsSubmitting(false);
    } else {
      onSuccess(data); // Pass the new transaction back to the parent
      onClose(); // Close the modal
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add New Entry</h2>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType('in')}
                className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${
                  type === 'in' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Cash In
              </button>
              <button
                type="button"
                onClick={() => setType('out')}
                className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${
                  type === 'out' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Cash Out
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};