import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { useRepledge } from "../../../hooks/useRepledgeforclose";
import { calculateRepledgeClose, type CalculationResults } from "../../../types/RepledgeCalcForClose";
import { supabase, type CloseRepledge } from "../../../lib/supabase";

export const CloseRepledge = (): JSX.Element => {
    const { loanId } = useParams<{ loanId: string }>();

    // State for form inputs
    const [endDate, setEndDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "upi">("cash");
    const [calculationMethod, setCalculationMethod] = useState<"method_1" | "method_2" | "method_3">("method_1");
    
    // State for calculations
    const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
    
    // State for saving
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { repledge, error, searchRepledgeByLoanId } = useRepledge();

    useEffect(() => {
        if (loanId) {
            searchRepledgeByLoanId(loanId);
        }
    }, [loanId, searchRepledgeByLoanId]);

    useEffect(() => {
        if (repledge && endDate) {
            const results = calculateRepledgeClose({
                startDate: repledge.start_date,
                endDate,
                amount: repledge.amount,
                interestRate: repledge.interest_percent,
                calculationMethod
            });
            setCalculationResults(results);
        } else {
            setCalculationResults(null);
        }
    }, [repledge, endDate, calculationMethod]);

    const handleSubmit = async () => {
        if (!repledge || !calculationResults || !endDate) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            const closeRepledgeData: Omit<CloseRepledge, 'id' | 'created_at'> = {
                repledge_id: repledge.id,
                end_date: endDate,
                payment_method: paymentMethod,
                calculation_method: calculationMethod,
                duration: calculationResults.duration,
                final_interest_rate: calculationResults.finalInterestRate,
                calculated_interest: calculationResults.calculatedInterest,
                total_payable: calculationResults.totalPayable
            };

            const { error } = await supabase
                .from('close_repledge')
                .insert([closeRepledgeData]);

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setEndDate("");
                setPaymentMethod("cash");
                setCalculationMethod("method_1");
                setCalculationResults(null);
            }, 3000);

        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save close repledge');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="bg-white min-h-screen">
            <div className="w-full max-w-md mx-auto bg-white">
                <div className="relative w-full">
                    <header className="w-full h-[73px] bg-black rounded-[0px_0px_47px_47px] flex items-center justify-center">
                        <h1 className="font-header-heading-semibold-heading-5-semibold font-[number:var(--header-heading-semibold-heading-5-semibold-font-weight)] text-white text-[length:var(--header-heading-semibold-heading-5-semibold-font-size)] text-center tracking-[var(--header-heading-semibold-heading-5-semibold-letter-spacing)] leading-[var(--header-heading-semibold-heading-5-semibold-line-height)] [font-style:var(--header-heading-semibold-heading-5-semibold-font-style)]">
                            Close Repledge
                        </h1>
                    </header>

                    <div className="px-4 sm:px-8 py-4 pb-24">
                        {error && (
                            <Alert variant="destructive" className="mb-6"> <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {saveSuccess && (
                            <Alert className="mb-6 border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">
                                    Repledge closed successfully!
                                </AlertDescription>
                            </Alert>
                        )}

                        {saveError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{saveError}</AlertDescription>
                            </Alert>
                        )}

                        {repledge && (
                            <>
                                <p className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-sm tracking-[0] leading-[normal] mb-6">
                                    Calculate final amount of repledge no #{repledge.re_no || repledge.loan_no}
                                </p>

                                {/* Repledge Details Section */}
                                <section className="mb-8">
                                    <h2 className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-sm tracking-[0] leading-[normal] text-center mb-4">
                                        Repledge Details
                                    </h2>
                                    <Card className="bg-white rounded-2xl border border-solid border-[#1f16164a]">
                                        <CardContent className="p-5">
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Bank:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {repledge.banks?.name || 'N/A'}
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Loan ID:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {repledge.loan_id}
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Re.no:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {repledge.re_no || repledge.loan_no}
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Start Date:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {format(new Date(repledge.start_date), 'dd/MM/yyyy')}
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Validity:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {repledge.validity_period} months
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Amount:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    ₹{repledge.amount.toLocaleString()}
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Int%:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {repledge.interest_percent}%
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Net Weight:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    {repledge.net_weight}g
                                                </div>
                                                
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    Processing Fee:
                                                </div>
                                                <div className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                    ₹{repledge.processing_fee.toLocaleString()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* Calculation Inputs Section */}
                                <section className="mb-8">
                                    <h2 className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-sm tracking-[0] leading-[normal] text-center mb-4">
                                        Calculation Inputs
                                    </h2>
                                    <Card className="bg-white rounded-xl border border-solid border-[#1f16164a]">
                                        <CardContent className="p-5">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-xs tracking-[0] leading-[normal] block mb-2">
                                                        End Date:
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-xs tracking-[0] leading-[normal] block mb-2">
                                                        Payment method:
                                                    </label>
                                                    <Select
                                                        value={paymentMethod}
                                                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                                                        className="w-full"
                                                    >
                                                        <option value="cash">Cash</option>
                                                        <option value="bank_transfer">Bank Transfer</option>
                                                        <option value="upi">UPI</option>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <label className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-xs tracking-[0] leading-[normal] block mb-2">
                                                        Calculation Method:
                                                    </label>
                                                    <Select
                                                        value={calculationMethod}
                                                        onChange={(e) => setCalculationMethod(e.target.value as any)}
                                                        className="w-full"
                                                    >
                                                        <option value="method_1">Calculation 1</option>
                                                        <option value="method_2" disabled>Calculation 2 (Coming Soon)</option>
                                                        <option value="method_3" disabled>Calculation 3 (Coming Soon)</option>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* Calculation Results Section */}
                                <section className="mb-8">
                                    <h2 className="[font-family:'Inter',Helvetica] font-normal text-gray-1 text-sm tracking-[0] leading-[normal] text-center mb-4">
                                        Calculation Results
                                    </h2>
                                    <Card className="bg-white rounded-2xl border border-solid border-[#1f16164a]">
                                        <CardContent className="p-5">
                                            <div className="space-y-4 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                        Duration:
                                                    </span>
                                                    <span className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                        {calculationResults ? `${calculationResults.duration} days` : '-'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <span className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                        Final Interest Rate:
                                                    </span>
                                                    <span className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                        {calculationResults ? `${calculationResults.finalInterestRate}%` : '-'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <span className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                        Calculated Interest:
                                                    </span>
                                                    <span className="[font-family:'Inter',Helvetica] font-normal text-gray-1">
                                                        {calculationResults ? `₹${calculationResults.calculatedInterest.toLocaleString()}` : '-'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between font-semibold">
                                                    <span className="[font-family:'Inter',Helvetica] font-semibold text-gray-1">
                                                        Total Payable:
                                                    </span>
                                                    <span className="[font-family:'Inter',Helvetica] font-semibold text-gray-1">
                                                        {calculationResults ? `₹${calculationResults.totalPayable.toLocaleString()}` : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* Note for disabled methods */}
                                {(calculationMethod === 'method_2' || calculationMethod === 'method_3') && (
                                    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                                        <AlertDescription className="text-yellow-800">
                                            This calculation method is not yet implemented. Only Calculation 1 is currently functional.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}

                        {/* Fixed Bottom Button */}
                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[361px] px-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={!repledge || !calculationResults || !endDate || isSaving}
                                className="w-full h-auto bg-black text-white rounded-full py-6 font-header-heading-semibold-heading-5-semibold font-[number:var(--header-heading-semibold-heading-5-semibold-font-weight)] text-[length:var(--header-heading-semibold-heading-5-semibold-font-size)] tracking-[var(--header-heading-semibold-heading-5-semibold-letter-spacing)] leading-[var(--header-heading-semibold-heading-5-semibold-line-height)] [font-style:var(--header-heading-semibold-heading-5-semibold-font-style)] hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Confirm & Close Repledge"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};