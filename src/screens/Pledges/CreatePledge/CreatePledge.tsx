import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { CustomerDetailsSection } from './sections/CustomerDetailsSection/CustomerDetailsSection';
import { JewelDetailsSection } from './sections/JewelDetailsSection/JewelDetailsSection';
import { LoanDetailsSection } from './sections/LoanDetailsSection/LoanDetailsSection';
import { Button } from '../../../components/ui/button';
import { SaveIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // --- 1. Import toast ---

export interface CustomerData {
  name: string;
  mobile_no: string;
  whatsapp_no: string;
  address: string;
  id_proof: string;
  photo_url: string;
  audio_url: string;
}

export interface JewelData {
  type: string;
  quality: string;
  description: string;
  custom_description?: string;
  pieces: number;
  weight: number;
  stone_weight: number;
  net_weight: number;
  faults: string;
  image_url: string;
}

export interface LoanData {
  loan_no: string;
  date: string;
  duedate: string;
  amount: number;
  interest_rate: string;
  validity_months: number;
  interest_taken: boolean;
  payment_method: string;
  processing_fee: number;
  estimated_amount: number;
  status: string;
}

export const CreatePledge = (): JSX.Element => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  // The error state is no longer needed, toast will handle it.
  // const [error, setError] = useState<string | null>(null); 

  const [jewelType, setJewelType] = useState("Gold");
  const [metalRate, setMetalRate] = useState(9000);

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    mobile_no: '',
    whatsapp_no: '',
    address: '',
    id_proof: '',
    photo_url: '',
    audio_url: '',
  });

  const [jewelData, setJewelData] = useState<JewelData[]>([{
    type: '',
    quality: '',
    description: '',
    pieces: 0,
    weight: 0,
    stone_weight: 0,
    net_weight: 0,
    faults: '',
    image_url: '',
  }]);

  const [loanData, setLoanData] = useState<LoanData>({
    loan_no: '',
    date: new Date().toISOString().split('T')[0],
    duedate: '',
    amount: 0,
    interest_rate: '',
    validity_months: 3,
    interest_taken: false,
    payment_method: '',
    processing_fee: 0,
    estimated_amount: 0,
    status: 'Active',
  });

  useEffect(() => {
    if (jewelData.length > 0 && jewelData[0].type) {
      setJewelType(jewelData[0].type);
    }
  }, [jewelData]);

  useEffect(() => {
    const fetchRate = async () => {
      const { data, error } = await supabase
        .from("metal_rates")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(2);

      if (error) {
        console.error("Error fetching metal rates:", error);
        return;
      }

      const goldRate = data.find(d => d.metal_type === "Gold")?.rate || 0;
      const silverRate = data.find(d => d.metal_type === "Silver")?.rate || 0;

      if (jewelType === "Silver") {
        setMetalRate(silverRate);
      } else {
        setMetalRate(goldRate);
      }
    };

    fetchRate();
  }, [jewelType]);


  const totalNetWeight = jewelData.reduce((sum, jewel) => sum + jewel.net_weight, 0);

  const handleLoanDataChange = (updatedLoanData: LoanData) => {
    setLoanData(updatedLoanData);
  };

  const validateForm = (): boolean => {
    // --- 2. Use toast.error for validation feedback ---
    if (!customerData.name.trim()) {
      toast.error('Customer name is required');
      return false;
    }
    if (!customerData.mobile_no.trim()) {
      toast.error('Mobile number is required');
      return false;
    }
    if (!loanData.loan_no.trim()) {
      toast.error('Loan number is required');
      return false;
    }
    if (loanData.amount <= 0) {
      toast.error('Loan amount must be greater than 0');
      return false;
    }
    if (jewelData.length === 0 || !jewelData[0].type) {
        toast.error('At least one jewel is required');
        return false;
    }

    for (let i = 0; i < jewelData.length; i++) {
        const jewel = jewelData[i];
        if (!jewel.type.trim()) {
            toast.error(`Jewel ${i + 1}: Type is required`);
            return false;
        }
        if (jewel.weight <= 0) {
            toast.error(`Jewel ${i + 1}: Weight must be greater than 0`);
            return false;
        }
    }

    return true;
  };

  // --- 3. Refactor handleSave with toast.promise ---
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    
    // This is the async function that toast.promise will track
    const savePledgePromise = async () => {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert([customerData])
          .select()
          .single();

        if (customerError) throw new Error(`Customer Error: ${customerError.message}`);

        const { data: loan, error: loanError } = await supabase
          .from('loans')
          .insert([{ ...loanData, customer_id: customer.id, metal_rate: metalRate }])
          .select()
          .single();

        if (loanError) throw new Error(`Loan Error: ${loanError.message}`);

        const jewelInserts = jewelData.map(jewel => ({ loan_id: loan.id, ...jewel }));
        const { error: jewelError } = await supabase.from('jewels').insert(jewelInserts);

        if (jewelError) throw new Error(`Jewel Error: ${jewelError.message}`);
        
        // Return the loan on success so the success handler can use it
        return loan;
    };

    await toast.promise(
        savePledgePromise(),
        {
            loading: 'Creating Pledge...',
            success: (loan) => {
                setSaving(false);
                navigate(`/print-notice/${loan.id}`);
                return <b>Pledge created successfully!</b>;
            },
            error: (err) => {
                setSaving(false);
                return <b>{err.message || 'Failed to create pledge.'}</b>;
            }
        }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/pledge-entry')}
          className="h-10 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 bg-white text-gray-700 font-medium transition-colors"
        >
          ← Back to New pledge
        </button>

        <div className="text-center mb-8 mt-8">
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          <div className="flex-1">
            <CustomerDetailsSection
              customerData={customerData}
              onCustomerDataChange={setCustomerData}
            />
          </div>

          <div className="flex-1">
            <JewelDetailsSection
              jewelData={jewelData}
              onJewelDataChange={setJewelData}
            />
          </div>

          <div className="flex-1">
            <LoanDetailsSection
              loanData={loanData}
              onLoanDataChange={handleLoanDataChange}
              jewelType={jewelType}
              totalNetWeight={totalNetWeight}
              metalRate={metalRate}
            />
          </div>
        </div>

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
            {saving ? 'Creating Pledge...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};
