import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MoreVertical, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AddEntryModal } from './AddEntryModal';
import { CreateCashLog } from './CreateCashLog'; 

// Interfaces remain the same
interface CashLog {
  id: string;
  log_date: string;
  location: string;
  shift: string;
  cash_transactions: CashTransaction[];
}

interface CashTransaction {
  id: string;
  purpose: string;
  amount_in: number | null;
  amount_out: number | null;
  timestamp: string;
}

const CashBook: React.FC = () => {
  const [cashLog, setCashLog] = useState<CashLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);

  useEffect(() => {
    const fetchCashLog = async () => {
      // --- MODIFIED --- We will now fetch the log for the CURRENT date
      const today = new Date().toISOString().slice(0, 10);

      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('cash_logs')
        .select(`
          id, log_date, location, shift,
          cash_transactions ( id, purpose, amount_in, amount_out, timestamp )
        `)
        .eq('log_date', today) // Fetch log specifically for today
        .order('timestamp', { foreignTable: 'cash_transactions', ascending: true }) // Sort transactions by time
        .maybeSingle();

      if (error) {
        console.error('Error fetching cash log:', error);
        setError('Could not fetch cash log data.');
      } else {
        setCashLog(data);
      }
      setIsLoading(false);
    };

    fetchCashLog();
  }, []);

  // --- NEW --- This function will be called by the CreateCashLog component
  const handleLogCreated = (newLog: CashLog) => {
    setCashLog(newLog);
  };

  const handleNewEntrySuccess = (newTransaction: CashTransaction) => {
    if (cashLog) {
      setCashLog({
        ...cashLog,
        cash_transactions: [...cashLog.cash_transactions, newTransaction],
      });
    }
  };

  const { totalIn, totalOut, balance } = useMemo(() => {
    if (!cashLog) return { totalIn: 0, totalOut: 0, balance: 0 };
    const totalIn = cashLog.cash_transactions.reduce((sum, t) => sum + (t.amount_in || 0), 0);
    const totalOut = cashLog.cash_transactions.reduce((sum, t) => sum + (t.amount_out || 0), 0);
    return { totalIn, totalOut, balance: totalIn - totalOut };
  }, [cashLog]);

  const formatAmount = (amount: number | null): string => {
    if (amount === null || amount === undefined) return '-';
    return amount.toLocaleString('en-IN');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  // --- MODIFIED --- Render the creation form if no log exists for today
  if (!cashLog) {
    return <CreateCashLog onLogCreated={handleLogCreated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-lg relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          {/* <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={24} />
          </button> */}
          <h1 className="text-xl font-bold text-gray-800">Daily Cash Log</h1>
          <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
            <MoreVertical size={24} />
          </button>
        </header>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-gray-800">{new Date(cashLog.log_date).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Branch</p>
              <p className="font-semibold text-gray-800">{cashLog.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Staff</p>
              <p className="font-semibold text-gray-800">{cashLog.shift}</p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3 pb-40">
          {/* --- NEW --- Show a message if there are no transactions yet */}
          {cashLog.cash_transactions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-gray-500">No transactions added yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add New Entry" to start.</p>
            </div>
          ) : (
            cashLog.cash_transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="w-2/5 pr-2">
                    <p className="text-sm text-gray-500 mb-1">Purpose</p>
                    <p className="font-medium text-gray-800">{transaction.purpose}</p>
                  </div>
                  <div className="w-1/4 text-right px-1">
                    <p className="text-sm text-gray-500 mb-1">In</p>
                    <p className={`font-semibold ${transaction.amount_in ? 'text-green-600' : 'text-gray-400'}`}>
                      {formatAmount(transaction.amount_in)}
                    </p>
                  </div>
                  <div className="w-1/4 text-right pl-1">
                    <p className="text-sm text-gray-500 mb-1">Out</p>
                    <p className={`font-semibold ${transaction.amount_out ? 'text-red-600' : 'text-gray-400'}`}>
                      {formatAmount(transaction.amount_out)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed Bottom Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t p-4 max-w-lg mx-auto rounded-t-2xl">
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total In</p>
              <p className="text-lg font-bold text-green-600">{formatAmount(totalIn)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total Out</p>
              <p className="text-lg font-bold text-red-600">{formatAmount(totalOut)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatAmount(balance)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddEntry(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center text-lg font-semibold hover:bg-blue-700"
          >
            <Plus size={24} className="mr-2" />
            Add New Entry
          </button>
        </div>
      </div>

      {showAddEntry && cashLog && (
        <AddEntryModal
          cashLogId={cashLog.id}
          onClose={() => setShowAddEntry(false)}
          onSuccess={handleNewEntrySuccess}
        />
      )}
    </div>
  );
};

export default CashBook;