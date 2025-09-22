import React, { useState } from 'react';
import { supabase } from '../../lib/supabase'; // Adjust path if needed

interface CreateCashLogProps {
  onLogCreated: (newLog: any) => void; // Callback to notify the parent
}

export const CreateCashLog: React.FC<CreateCashLogProps> = ({ onLogCreated }) => {
  const [location, setLocation] = useState('THRESPURAM'); // Default value
  const [shift, setShift] = useState('NSH-1'); // Default value
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!location || !shift) {
      setError('Location and Shift are required.');
      setIsSubmitting(false);
      return;
    }

    const { data: newLog, error: insertError } = await supabase
      .from('cash_logs')
      .insert({
        log_date: new Date().toISOString().slice(0, 10), // Today's date
        location,
        shift,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating cash log:', insertError);
      setError('Failed to create log. Please try again.');
      setIsSubmitting(false);
    } else {
      // Pass the newly created log back to the parent component
      onLogCreated({ ...newLog, cash_transactions: [] });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Start a New Day</h2>
        <p className="text-center text-gray-500 mb-8">No cash log found for today. Create one to begin.</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-6 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
              Staff
            </label>
            <input
              id="shift"
              type="text"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Log...' : 'Start Cash Log'}
          </button>
        </form>
      </div>
    </div>
  );
};