import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Building2, ChevronDown, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, Bank, RepledgeEntryInsert } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const repledgeSchema = z.object({
  bank_name: z.string().min(1, 'Bank selection is required'),
  jewel_details: z.string().min(1, 'Jewel details are required'),
  jewel_name: z.string().min(1, 'Jewel name is required'),
  pieces: z.number().min(1, 'Pieces must be at least 1'),
  gross_weight: z.number().min(0.001, 'Gross weight must be greater than 0'),
  stone_weight: z.number().min(0, 'Stone weight cannot be negative'),
  net_weight: z.number().min(0.001, 'Net weight must be greater than 0'),
  loan_no: z.string().min(1, 'Loan number is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  interest_rate: z.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate cannot exceed 100%'),
  validity: z.string().min(1, 'Validity date is required'),
  invest: z.number().min(0, 'Investment amount cannot be negative'),
  payment_method: z.enum(['Cash', 'Bank Transfer', 'UPI', 'Cheque'], {
    message: 'Payment method is required',
  }),
  repledge_interest: z.number().min(0, 'Repledge interest cannot be negative').max(100, 'Repledge interest cannot exceed 100%'),
  processing_fee: z.number().min(0, 'Processing fee cannot be negative'),
});

type RepledgeFormData = z.infer<typeof repledgeSchema>;

export const RepledgeEntryForm: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RepledgeFormData>({
    resolver: zodResolver(repledgeSchema),
    defaultValues: {
      pieces: 1,
      stone_weight: 0,
      processing_fee: 0,
      invest: 0,
      repledge_interest: 0,
    },
  });

  const selectedBank = watch('bank_name');

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('id, bank_name')
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

  const onSubmit = async (data: RepledgeFormData) => {
    setIsSubmitting(true);
    try {
      const repledgeData: RepledgeEntryInsert = {
        ...data,
        date: data.date,
        validity: data.validity,
      };

      const { error } = await supabase
        .from('repledge_entries')
        .insert([repledgeData]);

      if (error) throw error;

      toast.success('Repledge entry created successfully!');
      reset();
    } catch (error: any) {
      console.error('Error creating repledge entry:', error);
      if (error.code === '23505') {
        toast.error('Loan number already exists. Please use a unique loan number.');
      } else {
        toast.error('Failed to create repledge entry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const leftPanelFields = [
    { name: 'jewel_details', label: 'Jewel Details', type: 'text' },
    { name: 'jewel_name', label: 'Jewel Name', type: 'text' },
    { name: 'pieces', label: 'Pieces', type: 'number' },
    { name: 'gross_weight', label: 'Gross Weight (grams)', type: 'number', step: '0.001' },
    { name: 'stone_weight', label: 'Stone Weight (grams)', type: 'number', step: '0.001' },
    { name: 'net_weight', label: 'Net Weight (grams)', type: 'number', step: '0.001' },
    { name: 'loan_no', label: 'Loan No', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'amount', label: 'Amount (₹)', type: 'number', step: '0.01' },
    { name: 'interest_rate', label: 'Interest %', type: 'number', step: '0.01' },
  ];

  const rightPanelFields = [
    { name: 'validity', label: 'Validity', type: 'date' },
    { name: 'invest', label: 'Invest (₹)', type: 'number', step: '0.01' },
    { name: 'repledge_interest', label: 'Repledge Interest %', type: 'number', step: '0.01' },
    { name: 'processing_fee', label: 'Processing Fee (₹)', type: 'number', step: '0.01' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black text-white text-center py-4 rounded-t-3xl mb-8">
          <h1 className="text-2xl font-semibold">Re Pledge Entry</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 ">
            {/* Left Panel */}
            <div className="bg-white rounded-t-3xl p-8 shadow-lg">
              <div className="space-y-6">
                {/* Bank Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Bank *</label>
                  <div className="relative">
                    <div className="flex items-center rounded-3xl border border-gray-300 bg-gray-50 overflow-hidden">
                      <div className="flex items-center px-4 py-3">
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <div className="w-px h-6 bg-gray-300 mx-3" />
                      </div>
                      <Select
                        value={selectedBank}
                        onValueChange={(value) => setValue('bank_name', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="flex-1 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 h-auto p-0">
                          <SelectValue placeholder={isLoading ? "Loading banks..." : "Select bank"} />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.bank_name}>
                              {bank.bank_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                     
                    </div>
                    {errors.bank_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.bank_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Left Panel Fields */}
                {leftPanelFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {field.label} *
                    </label>
                    <Input
                      {...register(field.name as keyof RepledgeFormData, {
                        valueAsNumber: field.type === 'number',
                      })}
                      type={field.type}
                      step={field.step}
                      className="rounded-3xl border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                      placeholder={field.label}
                    />
                    {errors[field.name as keyof RepledgeFormData] && (
                      <p className="text-red-500 text-sm">
                        {errors[field.name as keyof RepledgeFormData]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="bg-white rounded-b-3xl p-8 shadow-lg">
              <div className="space-y-6">
                {/* Right Panel Fields */}
                {rightPanelFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {field.label} *
                    </label>
                    <Input
                      {...register(field.name as keyof RepledgeFormData, {
                        valueAsNumber: field.type === 'number',
                      })}
                      type={field.type}
                      step={field.step}
                      className="rounded-3xl border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                      placeholder={field.label}
                    />
                    {errors[field.name as keyof RepledgeFormData] && (
                      <p className="text-red-500 text-sm">
                        {errors[field.name as keyof RepledgeFormData]?.message}
                      </p>
                    )}
                  </div>
                ))}

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Method *</label>
                  <Select
                    value={watch('payment_method')}
                    onValueChange={(value) => setValue('payment_method', value as any)}
                  >
                    <SelectTrigger className="rounded-3xl border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_method && (
                    <p className="text-red-500 text-sm">{errors.payment_method.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  className="w-39px bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-3xl py-4 px-6 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 m-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};