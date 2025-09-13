import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Plus } from 'lucide-react';

interface CashTransaction {
  id: string;
  purpose: string;
  amountIn: number | null;
  amountOut: number | null;
  timestamp: string;
}

interface CashBookData {
  date: string;
  location: string;
  shift: string;
  transactions: CashTransaction[];
}

const CashBook: React.FC = () => {
  const [cashBookData] = useState<CashBookData>({
    date: '17/8/24',
    location: 'THRESPURAM',
    shift: 'NSH-1',
    transactions: [
      {
        id: '1',
        purpose: 'Opening Balance',
        amountIn: 68860,
        amountOut: null,
        timestamp: '2024-08-17T09:00:00Z'
      },
      {
        id: '2',
        purpose: 'NSH-786 JESINTHA',
        amountIn: null,
        amountOut: 2500,
        timestamp: '2024-08-17T10:30:00Z'
      },
      {
        id: '3',
        purpose: 'DAS ANNA',
        amountIn: null,
        amountOut: 3000,
        timestamp: '2024-08-17T11:15:00Z'
      },
      {
        id: '4',
        purpose: '851 MEGHALA',
        amountIn: null,
        amountOut: 9000,
        timestamp: '2024-08-17T12:45:00Z'
      },
      {
        id: '5',
        purpose: '7989 RELEASE',
        amountIn: 20800,
        amountOut: null,
        timestamp: '2024-08-17T14:20:00Z'
      },
      {
        id: '6',
        purpose: 'Customer Payment',
        amountIn: 15280,
        amountOut: null,
        timestamp: '2024-08-17T15:30:00Z'
      },
      {
        id: '7',
        purpose: 'Office Supplies',
        amountIn: null,
        amountOut: 1200,
        timestamp: '2024-08-17T16:10:00Z'
      },
      {
        id: '8',
        purpose: 'Service Revenue',
        amountIn: 8500,
        amountOut: null,
        timestamp: '2024-08-17T16:45:00Z'
      },
      {
        id: '9',
        purpose: 'Staff Advance',
        amountIn: null,
        amountOut: 5000,
        timestamp: '2024-08-17T17:15:00Z'
      },
      {
        id: '10',
        purpose: 'Daily Collection',
        amountIn: 12400,
        amountOut: null,
        timestamp: '2024-08-17T18:00:00Z'
      }
    ]
  });

  const [showAddEntry, setShowAddEntry] = useState(false);

  // Calculate totals
  const totalIn = cashBookData.transactions.reduce((sum, transaction) => 
    sum + (transaction.amountIn || 0), 0
  );

  const totalOut = cashBookData.transactions.reduce((sum, transaction) => 
    sum + (transaction.amountOut || 0), 0
  );

  const balance = totalIn - totalOut;

  const handleAddEntry = () => {
    setShowAddEntry(true);
  };

  const formatAmount = (amount: number | null): string => {
    if (amount === null) return '-';
    return amount.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-lg relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <button className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Daily Cash Log</h1>
          <button className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100">
            <MoreVertical size={24} />
          </button>
        </header>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-gray-800">{cashBookData.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-semibold text-gray-800">{cashBookData.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Shift</p>
              <p className="font-semibold text-gray-800">{cashBookData.shift}</p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3 pb-40">
          {cashBookData.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="w-2/5 pr-2">
                  <p className="text-sm text-gray-500 mb-1">Purpose</p>
                  <p className="font-medium text-gray-800 leading-tight">{transaction.purpose}</p>
                </div>
                <div className="w-1/4 text-right px-1">
                  <p className="text-sm text-gray-500 mb-1">In</p>
                  <p className={`font-semibold ${transaction.amountIn ? 'text-green-600' : 'text-gray-400'}`}>
                    {formatAmount(transaction.amountIn)}
                  </p>
                </div>
                <div className="w-1/4 text-right pl-1">
                  <p className="text-sm text-gray-500 mb-1">Out</p>
                  <p className={`font-semibold ${transaction.amountOut ? 'text-red-600' : 'text-gray-400'}`}>
                    {formatAmount(transaction.amountOut)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Bottom Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t border-gray-200 p-4 max-w-lg mx-auto rounded-t-2xl">
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
            onClick={handleAddEntry}
            className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={24} className="mr-2" />
            Add New Entry
          </button>
        </div>
      </div>

      {/* Add Entry Modal Placeholder */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Add New Entry</h2>
            <p className="text-gray-600 mb-4">Entry form will be implemented here.</p>
            <button
              onClick={() => setShowAddEntry(false)}
              className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBook;