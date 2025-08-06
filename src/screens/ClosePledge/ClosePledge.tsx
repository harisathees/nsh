// Updated ClosePledge.tsx
import { ArrowLeft, Trash2Icon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { calculateInterest, CalculationMethod } from '../../lib/calculateInterest';
import { useLoanCalculation } from "../../hooks/useLoanCalculation";

export const ClosePledge: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { loanData, loading, error, saving, saveCalculationAndCloseLoan } = useLoanCalculation(loanId || null);

  const [selectedMethod, setSelectedMethod] = useState<CalculationMethod>('method1');
  const [toDate, setToDate] = useState('');
  const [reductionAmount, setReductionAmount] = useState(0);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setToDate(today);
  }, []);

  const handleBack = () => navigate('/');

  const handleClosePledge = async () => {
    if (!loanData || !toDate) return;
    const result = calculateInterest(
      selectedMethod,
      loanData.date,
      toDate,
      loanData.amount,
      loanData.interest_rate,
      loanData.validity_months,
      loanData.interest_taken ? 'taken' : 'notTaken',
      reductionAmount
    );
    const success = await saveCalculationAndCloseLoan(toDate, reductionAmount, selectedMethod, result);
    if (success) {
      setShowSuccessMessage(true);
      setTimeout(() => navigate('/customers'), 2000);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading loan data...</p></div></div>;
  }

  if (showSuccessMessage) {
    return <div className="min-h-screen bg-white flex items-center justify-center p-4"><Card className="w-full max-w-md p-6 text-center"><div className="text-green-500 mb-4"><svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><h2 className="text-xl font-bold text-gray-900 mb-2">Pledge Closed Successfully!</h2><p className="text-gray-600 mb-4">The loan has been marked as closed and calculation saved.</p><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div></Card></div>;
  }

  if (error || !loanData) {
    return <div className="min-h-screen bg-white flex items-center justify-center p-4"><Card className="w-full max-w-md p-6 text-center"><div className="text-red-500 mb-4"><svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div><h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2><p className="text-gray-600 mb-4">{error || 'Loan data not found'}</p><Button onClick={handleBack} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Go Back</Button></Card></div>;
  }

  const result = calculateInterest(
    selectedMethod,
    loanData.date,
    toDate,
    loanData.amount,
    loanData.interest_rate,
    loanData.validity_months,
    loanData.interest_taken ? 'taken' : 'notTaken',
    reductionAmount
  );

  // Component continues as-is (no changes needed after this point)


  const methodOptions = [
    { value: 'method1', label: 'Scheme 1 (Maximum Interest)' },
    { value: 'method2', label: 'Scheme 2 (Minimum Interest)' },
    { value: 'method3', label: 'Scheme 3 (Medium Interest)' },
    { value: 'method4', label: 'Scheme 4 (Days Interest)' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-medium text-[#eb2b0b]">
            Close Pledge
          </h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="p-4 space-y-6">
          {/* Loan Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Loan Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Loan No: {loanData.loan_no}</p>
              <p>Amount: ₹{loanData.amount.toLocaleString()}</p>
              <p>Start Date: {new Date(loanData.date).toLocaleDateString()}</p>
              <p>Interest Rate: {loanData.interest_rate}% per month</p>
              <p>Interest interest {loanData.interest_taken.toLocaleString()}</p>
              {/* <p>Weight: {loanData.weight}</p> */}
              <p>Validity: {loanData.validity_months} months</p>
              <p>Status: <span className={`font-medium ${loanData.status === 'Closed' ? 'text-red-600' : 'text-green-600'}`}>{loanData.status}</span></p>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reduction Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Reduction Amount
            </label>
            <input
              type="number"
              value={reductionAmount}
              onChange={(e) => setReductionAmount(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Calculation Method Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calculation Method
            </label>
            <Badge 
              className="flex w-full items-center justify-between gap-1.5 px-4 py-3 bg-[#d9edff] text-[#1a71f6] hover:bg-[#d9edff] cursor-pointer"
              onClick={() => setShowMethodDropdown(!showMethodDropdown)}
            >
              <span className="font-medium">
                {methodOptions.find(m => m.value === selectedMethod)?.label}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showMethodDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Badge>
            
            {showMethodDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {methodOptions.map((option) => (
                  <button
                    key={option.value}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                    onClick={() => {
                      setSelectedMethod(option.value as CalculationMethod);
                      setShowMethodDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Months/Days</p>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                  {result.totalMonths}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Final Interest Rate</p>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                  {result.finalInterestRate}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                  ₹{result.totalInterest.toLocaleString()}
                </div>
              </div>
              {result.interestReduction > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Interest Reduced</p>
                  <div className="px-3 py-2 bg-red-50 rounded-md text-sm font-medium text-red-600">
                    -₹{result.interestReduction.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {result.additionalReduction > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Additional Reduction</p>
                <div className="px-3 py-2 bg-red-50 rounded-md text-sm font-medium text-red-600">
                  -₹{result.additionalReduction.toLocaleString()}
                </div>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#39a500]">Total</span>
              <div className="px-4 py-2 bg-green-50 rounded-md border border-[#3aa500]">
                <span className="font-bold text-[#3aa500]">
                  ₹{result.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-6">
            <Button 
              onClick={handleClosePledge}
              disabled={saving || loanData.status === 'Closed' || !toDate}
              className="w-full bg-[#fec6aa] hover:bg-[#fec6aa]/90 text-[#ed3e1f] font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ed3e1f] mr-2"></div>
                  Closing Pledge...
                </>
              ) : loanData.status === 'Closed' ? (
                <>
                  <span className="mr-2">Pledge Already Closed</span>
                  <Trash2Icon className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span className="mr-2">Close Pledge</span>
                  <Trash2Icon className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};