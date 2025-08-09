import React, { useEffect } from "react";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
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
  totalNetWeight, // ✅ Add this
  metalRate,       // ✅ Add this
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
  }, [jewelType]);
  useEffect(() => {
  const estimated = totalNetWeight * metalRate * 0.8;
  if (!isNaN(estimated)) {
    onLoanDataChange({ ...loanData, estimated_amount: Math.round(estimated) });
  }
}, [totalNetWeight, metalRate]);

useEffect(() => {
  if (loanData.date && loanData.validity_months) {
    const date = new Date(loanData.date);
    date.setMonth(date.getMonth() + Number(loanData.validity_months));
    const dueDateStr = date.toISOString().split("T")[0];
    onLoanDataChange({ ...loanData, duedate: dueDateStr });
  }
}, [loanData.date, loanData.validity_months]);





  const formFields = [
    { id: "loan_no", label: "Loan No", type: "text", value: loanData.loan_no, required: true },
    { id: "date", label: "Date", type: "date", value: loanData.date, required: true },
    { id: "amount", label: "Amount", type: "number", value: loanData.amount, required: true },
    { id: "interest_rate", label: "Interest %", type: "select", options: ["1", "1.5", "2", "2.5", "3", "5"], value: loanData.interest_rate },
    { id: "validity_months", label: "Validity Months", type: "select", options: ["3", "6", "12"], value: loanData.validity_months },
    { id: "duedate", label: "Due Date", type: "date", value: loanData.duedate, required: false },
    { id: "payment_method", label: "Payment Method", type: "select", value: loanData.payment_method, options: ["Cash", "UPI"] },
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
                {field.type === "select" ? (
                  <select
                    id={field.id}
                    value={String(field.value ?? "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange(
                        field.id as keyof LoanData,
                        field.id === "validity_months" || field.id === "interest_rate"
                          ? parseFloat(val)
                          : val
                      );
                    }}
                    className="h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid border-[#269AD4] text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] focus:border-[#269AD4] w-full"
                    disabled={field.id === "interest_rate" && jewelType === "Silver"}
                  >
                    <option value="">Select {field.label}</option>
                    {(field.id === "interest_rate" && jewelType === "Silver")
                      ? [<option key="5" value="5">5</option>]
                      : field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                  </select>
                ) : (
                  <Input
                    id={field.id}
                    placeholder={`${field.label}${field.required ? " *" : ""}`}
                    type={field.type}
                    value={field.value || ""}
                    readOnly={field.id === "duedate"}
                    onChange={(e) => {
                      let value: string | number = e.target.value;
                      if (field.type === "number") {
                        value = parseFloat(e.target.value) || 0;
                      }
                      handleInputChange(field.id as keyof LoanData, value);
                    }}
                    className={`h-[50px] px-4 py-3 bg-white rounded-[30px] border border-solid text-gray-700 text-sm font-normal focus:ring-2 focus:ring-[#fff5c5] ${
                      field.required ? "border-[#269AD4]" : "border-[#269AD4]"
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
                {/* <option value="Overdue">Overdue</option>
                <option value="Closed">Closed</option> */}
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
