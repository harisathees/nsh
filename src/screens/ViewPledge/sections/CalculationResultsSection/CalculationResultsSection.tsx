import React from "react";
import { Calculation } from "../../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { formatCurrency, formatDate } from "../../../../lib/loanUtils";

interface CalculationResultsSectionProps {
  calculation: Calculation;
}

export const CalculationResultsSection = ({ calculation }: CalculationResultsSectionProps): JSX.Element => {
  const calculationFields = [
    { id: "end-date", label: "End Date", value: formatDate(calculation.end_date) },
    { id: "calculation-method", label: "Calculation Method", value: calculation.calculation_method },
    { id: "total-months", label: "Total Months", value: calculation.total_months },
    { id: "final-interest-rate", label: "Final Interest Rate", value: calculation.final_interest_rate },
    { id: "total-interest", label: "Total Interest", value: formatCurrency(calculation.total_interest) },
    { id: "interest-reduction", label: "Interest Reduction", value: formatCurrency(calculation.interest_reduction) },
    { id: "additional-reduction", label: "Additional Reduction", value: formatCurrency(calculation.additional_reduction_amount) },
    { id: "total-amount", label: "Total Amount", value: formatCurrency(calculation.total_amount) },
  ];

  return (
    <Card className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Calculation Results</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Final Settlement
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {calculationFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor={field.id}>
                {field.label}
              </label>
              <Input
                id={field.id}
                value={field.value}
                readOnly
                className="h-12 rounded-2xl border-blue-200 bg-blue-50 text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          ))}
        </div>

        {/* Summary Box */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Final Amount:</span>
            <span className="text-2xl font-bold text-blue-800">
              {formatCurrency(calculation.total_amount)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            This is the total amount settled for this closed loan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};