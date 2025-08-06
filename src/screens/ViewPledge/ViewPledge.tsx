import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePledgeData } from "../../hooks/usePledgeData";
import { CustomerDetailsSection } from "./sections/CustomerDetailsSection/CustomerDetailsSection";
import { JewelDetailsSection } from "./sections/JewelDetailsSection/JewelDetailsSection";
import { LoanDetailsSection } from "./sections/LoanDetailsSection/LoanDetailsSection";
import { CalculationResultsSection } from "./sections/CalculationResultsSection/CalculationResultsSection";

export const ViewPledge = (): JSX.Element => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = usePledgeData(loanId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pledge data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading data</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No pledge data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/customers')}
              className="h-10 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 bg-white text-gray-700 font-medium transition-colors"
            >
              ← Back to Customers
            </button>
            <div className="text-sm text-gray-600">
              Viewing Loan ID: <span className="font-medium text-gray-800">{loanId}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Customer Details Section */}
          <div className="flex-1 lg:max-w-md">
            <CustomerDetailsSection customer={data.customer} />
          </div>
          
          {/* Jewel Details Section */}
          <div className="flex-1 lg:max-w-md">
            <JewelDetailsSection jewels={data.jewels} />
          </div>
          
          {/* Loan Details Section */}
          <div className="flex-1 lg:max-w-md">
            <LoanDetailsSection loan={data.loan} calculation={data.calculation} />
            
            {/* Calculation Results Section - Only for Closed Loans */}
            {data.loan.status === 'Closed' && data.calculation && (
              <div className="mt-6">
                <CalculationResultsSection calculation={data.calculation} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};