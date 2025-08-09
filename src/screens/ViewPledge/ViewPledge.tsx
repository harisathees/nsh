import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePledgeData } from "../../hooks/usePledgeData";
import { CustomerDetailsSection } from "./sections/CustomerDetailsSection/CustomerDetailsSection";
import { JewelDetailsSection } from "./sections/JewelDetailsSection/JewelDetailsSection";
import { LoanDetailsSection } from "./sections/LoanDetailsSection/LoanDetailsSection";
import { CalculationResultsSection } from "./sections/CalculationResultsSection/CalculationResultsSection";
import { PrinterIcon } from "lucide-react"; // Import icon

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
      {/* Header with back and print button */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
              <button
              onClick={() => navigate('/customers')}
              className="h-10 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 bg-white text-gray-700 font-medium transition-colors mb-3"
            >
              ← Back to Customers
            </button>
           
          </div>

          {/* Print Button */}
          <button
            onClick={() => navigate(`/print-notice/${loanId}`)}
            className="flex items-center gap-2 h-10 px-4 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl"
          >
            <PrinterIcon className="w-5 h-5" />
            Print Notice
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Sections */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 lg:max-w-md">
            <CustomerDetailsSection customer={data.customer} />
          </div>
          <div className="flex-1 lg:max-w-md">
            <JewelDetailsSection jewels={data.jewels} />
          </div>
          <div className="flex-1 lg:max-w-md">
            <LoanDetailsSection loan={data.loan} calculation={data.calculation} />
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
