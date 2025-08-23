import { PencilIcon, Trash2Icon } from "lucide-react";
import React from "react";
import { Loan } from "../../../../lib/supabase";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { formatCurrency, formatDate, getStatusColor } from "../../../../lib/loanUtils";
import { useNavigate } from 'react-router-dom';

interface LoanDetailsSectionProps {
  loan: Loan;
}

export const LoanDetailsSection = ({ loan }: LoanDetailsSectionProps): JSX.Element => {

  const loanFields = [
    { id: "loan-no", label: "Loan No", value: loan.loan_no || "N/A" },
    { id: "date", label: "Date", value: formatDate(loan.date) },
    { id: "amount", label: "Amount", value: formatCurrency(loan.amount) },
    { id: "interest", label: "Interest %", value: loan.interest_rate ? `${loan.interest_rate}%` : "N/A" },
    { id: "validity", label: "Validity Months", value: loan.validity_months?.toString() || "N/A" },
    { id: "interest-taken", label: "Interest Taken?", value: loan.interest_taken ? "Yes" : "No" },
    { id: "payment-method", label: "Payment Method", value: loan.payment_method || "N/A" },
    { id: "processing-fee", label: "Processing Fee", value: formatCurrency(loan.processing_fee) },
    { id: "estimated-amount", label: "Estimated Amount", value: formatCurrency(loan.estimated_amount) },
  ];

  const getHeaderGradient = (status: string | null) => {
    switch (status) {
      case 'Active':
        return 'bg-gradient-to-r from-green-50 to-emerald-50';
      case 'Overdue':
        return 'bg-gradient-to-r from-violet-50 to-purple-50';
      case 'Closed':
        return 'bg-gradient-to-r from-red-50 to-pink-50';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50';
    }
   
  };
 const navigate = useNavigate();
 const navigate1 = useNavigate();
  return (
    <Card className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
      <CardHeader className={`p-6 ${getHeaderGradient(loan.status)}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Loan Details
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status || 'Unknown')}`}>
            {loan.status}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        
        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {loanFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor={field.id}>
                {field.label}
              </label>
              <Input
                id={field.id}
                value={field.value}
                readOnly
                className="h-12 rounded-2xl border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {loan.status !== 'Closed' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          
            <Button
              onClick={() => navigate(`/edit-pledge/${loan.id}`)}
              variant="outline"
              className="flex-1 h-12 bg-yellow-50 text-yellow-700 border-yellow-200 rounded-2xl hover:bg-yellow-100 hover:border-yellow-300 transition-colors duration-200"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>

            <Button
              onClick={() => navigate1(`/close-pledge/${loan.id}`)}
              variant="outline"
              className="flex-1 h-12 bg-red-50 text-red-700 border-red-200 rounded-2xl hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
            >
              <Trash2Icon className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};