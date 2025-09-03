import React from "react";
import { Card } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { LoanData } from "../../EditPledge";

interface LoanDetailsSectionProps {
  loanData: LoanData;
  onLoanDataChange: (data: LoanData) => void;
}

export const LoanDetailsSection = ({
  loanData,
  onLoanDataChange,
}: LoanDetailsSectionProps): JSX.Element => {
  const handleInputChange = (field: keyof LoanData, value: string | number | boolean) => {
    onLoanDataChange({
      ...loanData,
      [field]: value,
    });
  };

  const formFields = [
    { id: "loan_no", label: "Loan No", type: "text", value: loanData.loan_no },
    { id: "date", label: "Date", type: "date", value: loanData.date },
    { id: "amount", label: "Amount", type: "number", value: loanData.amount },
    { id: "interest_rate", label: "Interest %", type: "number", value: loanData.interest_rate },
    { id: "validity_months", label: "Validity Months", type: "number", value: loanData.validity_months },
    { id: "payment_method", label: "Payment Method", type: "text", value: loanData.payment_method },
    { id: "processing_fee", label: "Processing Fee", type: "number", value: loanData.processing_fee },
    { id: "estimated_amount", label: "Estimated Amount", type: "number", value: loanData.estimated_amount },
  ];

  return (
    <Card className="w-full rounded-[30px] bg-white shadow-lg">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <h2 className="font-normal text-black text-lg">
            Loan Details
          </h2>

          <div className="flex flex-col gap-4">
            {formFields.map((field) => (
              <div key={field.id} className="relative">
                <Input
                  id={field.id}
                  placeholder={field.label}
                  type={field.type}
                  value={field.value || ""}
                  onChange={(e) => {
                    let value: string | number = e.target.value;
                    if (field.type === "number") {
                      value = parseFloat(e.target.value) || 0;
                    }
                    handleInputChange(field.id as keyof LoanData, value);
                  }}
                  className="h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#ea9f39] text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] focus:border-[#ea9f39]"
                />
              </div>
            ))}

            {/* Interest Taken Toggle */}
            <div className="relative">
              <div className="flex items-center gap-3 h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#ea9f39]">
                <label htmlFor="interest_taken" className="text-sm text-gray-700 flex-1">
                  Interest Taken?
                </label>
                <input
                  id="interest_taken"
                  type="checkbox"
                  checked={loanData.interest_taken || false}
                  onChange={(e) => handleInputChange("interest_taken", e.target.checked)}
                  className="w-5 h-5 text-[#ea9f39] bg-gray-100 border-gray-300 rounded focus:ring-[#ea9f39] focus:ring-2"
                />
              </div>
            </div>

            {/* Status Field */}
            <div className="relative">
              <select
                value={loanData.status || "Active"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#ea9f39] text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] focus:border-[#ea9f39] w-full"
              >
                <option value="Active">Active</option>
                <option value="Overdue">Overdue</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};