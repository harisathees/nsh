import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { LoadingCard } from "../../../components/customerpic&loadingcardforviewrepledge/LoadingCard";
import { useRepledgeData } from "../../../hooks/useRepledgeData";
import { supabase,Bank } from "../../../lib/supabase";

export const EditRepledge = (): JSX.Element => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useRepledgeData(loanId || '');
  
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    re_no: '',
    amount: '',
    processing_fee: '',
    interest_percent: '',
    validity_period: '',
    after_interest_percent: '',
    payment_method: '',
    start_date: '',
    end_date: '',
    bank_id: ''
  });

  // Load banks for dropdown
  useEffect(() => {
    const fetchBanks = async () => {
      const { data: banksData, error } = await supabase
        .from('banks')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (!error && banksData) {
        setBanks(banksData);
      }
    };
    
    fetchBanks();
  }, []);

  // Populate form when data loads
  useEffect(() => {
    if (data.repledge) {
      setFormData({
        re_no: data.repledge.re_no || '',
        amount: data.repledge.amount?.toString() || '',
        processing_fee: data.repledge.processing_fee?.toString() || '',
        interest_percent: data.repledge.interest_percent?.toString() || '',
        validity_period: data.repledge.validity_period?.toString() || '',
        after_interest_percent: data.repledge.after_interest_percent?.toString() || '',
        payment_method: data.repledge.payment_method || '',
        start_date: data.repledge.start_date || '',
        end_date: data.repledge.end_date || '',
        bank_id: data.repledge.bank_id || ''
      });
    }
  }, [data.repledge]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!data.repledge?.id) {
      setSaveError('No repledge entry found to update');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updateData = {
        re_no: formData.re_no,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        processing_fee: formData.processing_fee ? parseFloat(formData.processing_fee) : 0,
        interest_percent: formData.interest_percent ? parseFloat(formData.interest_percent) : null,
        validity_period: formData.validity_period ? parseInt(formData.validity_period) : null,
        after_interest_percent: formData.after_interest_percent ? parseFloat(formData.after_interest_percent) : null,
        payment_method: formData.payment_method,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        bank_id: formData.bank_id || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('repledge_entries')
        .update(updateData)
        .eq('id', data.repledge.id);

      if (error) throw error;

      // Navigate back to view page
      navigate(`/view-repledge/${loanId}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white min-h-screen w-full max-w-[393px] mx-auto lg:max-w-2xl">
        <header className="bg-black rounded-b-[47px] h-[53px] flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-header-heading-semibold-heading-5 font-[number:var(--header-heading-semibold-heading-5-semibold-font-weight)] text-white text-[length:var(--header-heading-semibold-heading-5-semibold-font-size)] text-center tracking-[var(--header-heading-semibold-heading-5-semibold-letter-spacing)] leading-[var(--header-heading-semibold-heading-5-semibold-line-height)] [font-style:var(--header-heading-semibold-heading-5-semibold-font-style)]">
            Edit Repledge
          </h1>
          <div className="w-9"></div>
        </header>
        <div className="p-6 text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full max-w-[393px] mx-auto lg:max-w-2xl">
      <header className="bg-black rounded-b-[47px] h-[53px] flex items-center justify-between px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/view-repledge/${loanId}`)}
          className="text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-header-heading-semibold-heading-5 font-[number:var(--header-heading-semibold-heading-5-semibold-font-weight)] text-white text-[length:var(--header-heading-semibold-heading-5-semibold-font-size)] text-center tracking-[var(--header-heading-semibold-heading-5-semibold-letter-spacing)] leading-[var(--header-heading-semibold-heading-5-semibold-line-height)] [font-style:var(--header-heading-semibold-heading-5-semibold-font-style)]">
          Edit Repledge
        </h1>
        <div className="w-9"></div>
      </header>
      

      <main className="px-1 py-4 space-y-6 pb-32">
        {loading ? (
          <>
            <LoadingCard title="Loading repledge details..." />
            <LoadingCard title="Loading form data..." />
          </>
        ) : (
          <>
            {/* Edit Repledge Form */}
            <section>
              <h2 className="font-inter font-normal text-gray-1 text-sm mb-4">
                Edit repledge details of loan no {data.loan?.loan_no || '-'}
              </h2>

              <Card className="border border-solid border-[#1f16164a] rounded-2xl">
                <CardContent className="p-5 space-y-4">
                  {/* Bank Selection */}
                  <div className="space-y-2">
                    <label className="font-inter font-normal text-gray-1 text-xs">Bank:</label>
                    <select
                      value={formData.bank_id}
                      onChange={(e) => handleInputChange('bank_id', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select Bank</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name} {bank.branch && `- ${bank.branch}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Re.no and Re Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Re.no:</label>
                      <Input
                        type="text"
                        value={formData.re_no}
                        onChange={(e) => handleInputChange('re_no', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter re number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Re Amount:</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Validity and Processing Fee */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Validity (months):</label>
                      <Input
                        type="number"
                        value={formData.validity_period}
                        onChange={(e) => handleInputChange('validity_period', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Processing Fee:</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.processing_fee}
                        onChange={(e) => handleInputChange('processing_fee', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Start Date and End Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Start Date:</label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">End Date:</label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Interest Rates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Int%:</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.interest_percent}
                        onChange={(e) => handleInputChange('interest_percent', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="12.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-inter font-normal text-gray-1 text-xs">Int% Aft val:</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.after_interest_percent}
                        onChange={(e) => handleInputChange('after_interest_percent', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="15.00"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="font-inter font-normal text-gray-1 text-xs">Payment Method:</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => handleInputChange('payment_method', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>

                  {saveError && (
                    <div className="text-red-600 text-sm font-inter bg-red-50 p-3 rounded-lg">
                      {saveError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Read-only Loan Details for Reference */}
            <section>
              <h2 className="font-inter font-normal text-gray-1 text-sm mb-4">
                Loan details (read-only)
              </h2>

              <Card className="border border-solid border-gray-200 rounded-2xl bg-gray-50">
                <CardContent className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="font-inter font-normal text-gray-500 text-xs">Customer:</div>
                      <div className="font-inter font-medium text-gray-700 text-sm">
                        {data.customer?.name || '-'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-inter font-normal text-gray-500 text-xs">Loan No:</div>
                      <div className="font-inter font-medium text-gray-700 text-sm">
                        {data.loan?.loan_no || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="font-inter font-normal text-gray-500 text-xs">Original Amount:</div>
                      <div className="font-inter font-medium text-gray-700 text-sm">
                        {data.loan?.amount ? `₹${data.loan.amount.toLocaleString('en-IN')}` : '-'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-inter font-normal text-gray-500 text-xs">Status:</div>
                      <div className="font-inter font-medium text-gray-700 text-sm">
                        {data.loan?.status || '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Jewel Details for Reference */}
            {data.jewels.length > 0 && (
              <section>
                <h2 className="font-inter font-normal text-gray-1 text-sm mb-4">
                  Jewel details (read-only)
                </h2>

                <div className="space-y-3">
                  {data.jewels.map((jewel, index) => (
                    <Card key={jewel.id} className="border border-solid border-gray-200 rounded-2xl bg-gray-50">
                      <CardContent className="p-4 space-y-2">
                        {data.jewels.length > 1 && (
                          <div className="font-inter font-medium text-gray-700 text-sm mb-2">
                            Jewel {index + 1}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="font-inter font-normal text-gray-500">Type:</div>
                            <div className="font-inter font-medium text-gray-700">
                              {jewel.type || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="font-inter font-normal text-gray-500">Quality:</div>
                            <div className="font-inter font-medium text-gray-700">
                              {jewel.quality || '-'}
                            </div>
                          </div>
                          <div>
                            <div className="font-inter font-normal text-gray-500">Weight:</div>
                            <div className="font-inter font-medium text-gray-700">
                              {jewel.weight ? `${jewel.weight}g` : '-'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Action Buttons */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-[393px] lg:max-w-2xl mx-auto p-6 bg-white border-t border-gray-100">
        <div className="flex justify-between gap-3">
          <Button 
            onClick={handleSave}
            disabled={isSaving || loading}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-header-heading-semibold-heading-5-semibold rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>

          <Button 
            onClick={() => navigate(`/view-repledge/${loanId}`)}
            variant="outline"
            className="flex-1 h-12 border-black text-black hover:bg-gray-50 font-header-heading-semibold-heading-5-semibold rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </footer>
    </div>
  );
};