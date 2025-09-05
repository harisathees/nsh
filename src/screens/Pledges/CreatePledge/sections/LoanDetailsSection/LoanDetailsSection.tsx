import React, { useEffect } from "react";
import { Card } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { LoanData } from "../../CreatePledge";

interface LoanDetailsSectionProps {
  loanData: LoanData;
  onLoanDataChange: (data: LoanData) => void;
  jewelType: string;
  totalNetWeight: number;
  metalRate: number;
}

export const LoanDetailsSection = ({
  loanData,
  onLoanDataChange,
  jewelType,
  totalNetWeight,
  metalRate,
}: LoanDetailsSectionProps): JSX.Element => {
  const handleInputChange = (field: keyof LoanData, value: string | number | boolean) => {
    onLoanDataChange({
      ...loanData,
      [field]: value,
    });
  };

  useEffect(() => {
    if (jewelType === "Silver" && loanData.interest_rate !== "5") {
      onLoanDataChange({ ...loanData, interest_rate: "5" });
    }
  }, [jewelType, loanData, onLoanDataChange]);

  useEffect(() => {
    const estimated = totalNetWeight * metalRate * 0.8;
    if (!isNaN(estimated) && Math.round(estimated) !== loanData.estimated_amount) {
      onLoanDataChange({ ...loanData, estimated_amount: Math.round(estimated) });
    }
  }, [totalNetWeight, metalRate, loanData, onLoanDataChange]);

  useEffect(() => {
    if (loanData.date && loanData.validity_months) {
      const date = new Date(loanData.date);
      date.setMonth(date.getMonth() + Number(loanData.validity_months));
      const dueDateStr = date.toISOString().split("T")[0];
      if (dueDateStr !== loanData.duedate) {
        onLoanDataChange({ ...loanData, duedate: dueDateStr });
      }
    }
  }, [loanData.date, loanData.validity_months, loanData, onLoanDataChange]);

  useEffect(() => {
  const amount = Number(loanData.amount) || 0;
  let fee = amount * 0.0025; // Use 'let' to allow modification

  // --- Logic to cap the fee at 300 ---
  if (fee > 300) {
    fee = 300;
  }

  // Only update the state if the calculated fee is different
  if (fee !== loanData.processing_fee) {
    onLoanDataChange({ ...loanData, processing_fee: fee });
  }
}, [loanData.amount, loanData.processing_fee, onLoanDataChange, loanData]);

  const formFields = [
    { id: "loan_no", label: "Loan No", type: "text", value: loanData.loan_no, required: true },
    { id: "date", label: "Date", type: "date", value: loanData.date, required: true },
    { id: "amount", label: "Amount", type: "number", value: loanData.amount, required: true },
    { id: "interest_rate", label: "Interest %", type: "select", options: ["1", "1.5", "2", "2.5", "3", "5"], value: loanData.interest_rate },
    { id: "validity_months", label: "Validity Months", type: "select", options: ["3", "6", "12"], value: loanData.validity_months },
    { id: "duedate", label: "Due Date", type: "date", value: loanData.duedate, readOnly: true },
    { id: "payment_method", label: "Payment Method", type: "select", value: loanData.payment_method, options: ["Cash", "UPI"] },
    { id: "processing_fee", label: "Processing Fee", type: "number", value: loanData.processing_fee},
    { id: "estimated_amount", label: "Estimated Amount", type: "number", value: loanData.estimated_amount, readOnly: true },
  ];
  
  const calculateAmountToBeGiven = () => {
    const amount = Number(loanData.amount) || 0;
    const processingFee = Number(loanData.processing_fee) || 0;
    let finalAmount = amount - processingFee;

    if (loanData.interest_taken) {
      const interestRate = parseFloat(loanData.interest_rate) || 0;
      const interestAmount = (amount * interestRate) / 100;
      finalAmount -= interestAmount;
    }
    return finalAmount;
  };

  const amountToBeGiven = calculateAmountToBeGiven();

  return (
    <Card className="w-full rounded-[30px] bg-white shadow-lg">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <h2 className="font-normal text-black text-lg">Loan Details</h2>
          <div className="flex flex-col gap-4">
            {formFields.map((field) => (
              <div key={field.id} className="relative">
                <label className="block mb-5 text-sm font-medium text-black-700 px-2">
                  {field.label}{field.required ? " *" : ""}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.id}
                    value={String(field.value ?? "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange(
                        field.id as keyof LoanData,
                        field.id === "validity_months" || field.id === "interest_rate" ? parseFloat(val) : val
                      );
                    }}
                    className="h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#269AD4] text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] focus:border-[#269AD4] w-full"
                    disabled={field.id === "interest_rate" && jewelType === "Silver"}
                  >
                    <option value="">Select {field.label}</option>
                    {(field.id === "interest_rate" && jewelType === "Silver") ?
                      [<option key="5" value="5">5</option>] :
                      field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))
                    }
                  </select>
                ) : (
                  <Input
                    id={field.id}
                    placeholder={`${field.label}${field.required ? " *" : ""}`}
                    type={field.type}
                    // --- ⬇️ THIS IS THE FIX ⬇️ ---
                    // The value prop is now simplified to prevent formatting issues while typing.
                    value={field.value || ""}
                    readOnly={field.readOnly}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      // Allow the input to be cleared
                      if (rawValue === '') {
                          handleInputChange(field.id as keyof LoanData, '');
                      } else {
                          let value: string | number = rawValue;
                          if (field.type === "number") {
                              value = parseFloat(rawValue);
                          }
                          handleInputChange(field.id as keyof LoanData, value);
                      }
                    }}
                    className={`h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] ${field.readOnly ? 'bg-gray-200 cursor-not-allowed' : ''} ${field.required ? "border-[#269AD4]" : "border-[#269AD4]"
                      } focus:border-[#269AD4]`}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            {/* Interest Taken Toggle */}
            <div className="relative">
              <div className="flex items-center gap-3 h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#269AD4]">
                <label htmlFor="interest_taken" className="text-sm text-gray-700 flex-1">
                  Interest Taken?
                </label>
                <input
                  id="interest_taken"
                  type="checkbox"
                  checked={loanData.interest_taken || false}
                  onChange={(e) => handleInputChange("interest_taken", e.target.checked)}
                  className="w-5 h-5 text-[#269AD4] bg-gray-100 border-gray-300 rounded focus:ring-[#269AD4] focus:ring-2"
                />
              </div>
            </div>

            {/* Status Field */}
            <div className="relative">
              <select
                value={loanData.status || "Active"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#269AD4] text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] focus:border-[#269AD4] w-full"
              >
                <option value="Active">Active</option>
              </select>
            </div>
            
            <div className="relative pt-2">
              <div className="flex justify-between items-baseline py-3 px-2 border-t border-dashed">
                <label className="text-base font-medium text-black-700">
                  Amount to be Given
                </label>
                <p className="text-2xl font-bold text-green-700">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                  }).format(amountToBeGiven)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Card>
  );
};