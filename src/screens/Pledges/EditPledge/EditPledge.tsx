import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { CustomerDetailsSection } from './sections/CustomerDetailsSection/CustomerDetailsSection';
import { JewelDetailsSection } from './sections/JewelDetailsSection/JewelDetailsSection';
import { LoanDetailsSection } from './sections/LoanDetailsSection/LoanDetailsSection';
import { Button } from '../../../components/ui/button';
import { SaveIcon, Loader2 } from 'lucide-react';

// You can place this component definition at the top of your file
const GoldCoinSpinner: React.FC<{ text?: string }> = ({ text = "Loading pledge data..." }) => (
  <div className="flex flex-col items-center justify-center py-20" aria-label="Loading">
    <svg className="coin-spinner w-16 h-16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4"/>
      <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
    </svg>
    <p className="mt-4 text-sm font-semibold text-amber-800">{text}</p>
  </div>
);

export interface CustomerData {
  id: string;
  name: string;
  mobile_no: string;
  whatsapp_no: string;
  address: string;
  id_proof: string;
  photo_url: string;
  audio_url: string;
}

export interface JewelData {
  id: string;
  loan_id: string;
  type: string;
  quality: string;
  description: string;
  pieces: number;
  weight: number;
  stone_weight: number;
  net_weight: number;
  faults: string;
  image_url: string;
}

export interface LoanData {
  id: string;
  loan_no: string;
  customer_id: string;
  date: string;
  amount: number;
  interest_rate: number;
  validity_months: number;
  interest_taken: boolean;
  payment_method: string;
  processing_fee: number;
  estimated_amount: number;
  status: string;
}

export const EditPledge = (): JSX.Element => {
  const { loanId } = useParams<{ loanId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [jewelData, setJewelData] = useState<JewelData[]>([]);
  const [loanData, setLoanData] = useState<LoanData | null>(null);

  useEffect(() => {
    if (loanId) {
      fetchData();
    }
  }, [loanId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // If it's test mode, load demo data
      if (loanId === 'test') {
        setCustomerData({
          id: 'test-customer',
          name: 'John Doe',
          mobile_no: '+1234567890',
          whatsapp_no: '+1234567890',
          address: '123 Main Street, City, State',
          id_proof: 'ID123456',
          photo_url: '',
          audio_url: '',
        });
        
        setLoanData({
          id: 'test-loan',
          loan_no: 'LOAN001',
          customer_id: 'test-customer',
          date: '2024-01-15',
          amount: 50000,
          interest_rate: 12,
          validity_months: 12,
          interest_taken: false,
          payment_method: 'Cash',
          processing_fee: 500,
          estimated_amount: 52000,
          status: 'Active',
        });
        
        setJewelData([
          {
            id: 'test-jewel-1',
            loan_id: 'test-loan',
            type: 'Gold Chain',
            quality: '22K',
            description: 'Beautiful gold chain',
            pieces: 1,
            weight: 25.5,
            stone_weight: 0,
            net_weight: 25.5,
            faults: 'None',
            image_url: '',
          }
        ]);
        
        setLoading(false);
        return;
      }

      // Fetch loan data
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError) {
        console.error('Loan fetch error:', loanError);
        throw new Error(`Failed to fetch loan: ${loanError.message}`);
      }

      if (!loan) {
        throw new Error('Loan not found');
      }

      // Fetch customer data
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', loan.customer_id)
        .single();

      if (customerError) {
        console.error('Customer fetch error:', customerError);
        throw new Error(`Failed to fetch customer: ${customerError.message}`);
      }

      if (!customer) throw new Error('Customer not found');

      // Fetch jewel data
      const { data: jewels, error: jewelError } = await supabase
        .from('jewels')
        .select('*')
        .eq('loan_id', loanId);

      if (jewelError) {
        console.error('Jewel fetch error:', jewelError);
        throw new Error(`Failed to fetch jewels: ${jewelError.message}`);
      }

      setLoanData(loan);
      setCustomerData(customer);
      setJewelData(jewels || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customerData || !loanData) return;

    // For demo mode, just show success message
    if (loanId === 'test') {
      alert('Demo mode: Changes saved successfully!');
      return;
    }
    try {
      setSaving(true);
      setError(null);

      // Update customer data
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          mobile_no: customerData.mobile_no,
          whatsapp_no: customerData.whatsapp_no,
          address: customerData.address,
          id_proof: customerData.id_proof,
          photo_url: customerData.photo_url,
          audio_url: customerData.audio_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerData.id);

      if (customerError) throw customerError;

      // Update loan data
      const { error: loanError } = await supabase
        .from('loans')
        .update({
          loan_no: loanData.loan_no,
          date: loanData.date,
          amount: loanData.amount,
          interest_rate: loanData.interest_rate,
          validity_months: loanData.validity_months,
          interest_taken: loanData.interest_taken,
          payment_method: loanData.payment_method,
          processing_fee: loanData.processing_fee,
          estimated_amount: loanData.estimated_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanData.id);

      if (loanError) throw loanError;

      // Update jewel data
      for (const jewel of jewelData) {
        const { error: jewelError } = await supabase
          .from('jewels')
          .update({
            type: jewel.type,
            quality: jewel.quality,
            description: jewel.description,
            pieces: jewel.pieces,
            weight: jewel.weight,
            stone_weight: jewel.stone_weight,
            net_weight: jewel.net_weight,
            faults: jewel.faults,
            image_url: jewel.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jewel.id);

        if (jewelError) throw jewelError;
      }

      alert('Data saved successfully!');
    } catch (err) {
      console.error('Error saving data:', err);
      setError('Failed to save data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <GoldCoinSpinner text="Loading pledge data..." />
    </div>
  );
}

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!customerData || !loanData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No data found for this loan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <button
              onClick={() => navigate('/customers')}
              className="h-10 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 bg-white text-gray-700 font-medium transition-colors mb-5"
            >
              ← Back to Customers
            </button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Pledge</h1>
          <p className="text-gray-600">Loan ID: {loanData.loan_no}</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Customer Details Section */}
          <div className="flex-1">
            <CustomerDetailsSection
              customerData={customerData}
              onCustomerDataChange={setCustomerData}
            />
          </div>

          {/* Jewel Details Section */}
          <div className="flex-1">
            <JewelDetailsSection
              jewelData={jewelData}
              onJewelDataChange={setJewelData}
              loanId={loanId!}
            />
          </div>

          {/* Loan Details Section */}
          <div className="flex-1">
            <LoanDetailsSection
              loanData={loanData}
              onLoanDataChange={setLoanData}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-12 px-8 py-3 bg-[#d9edff] rounded-[31.5px] text-[#014f70] hover:bg-[#c8e6ff] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SaveIcon className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Finished'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};