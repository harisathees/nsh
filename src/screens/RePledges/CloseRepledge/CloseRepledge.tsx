import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Calendar, Landmark, Hash, Wallet, Loader2, ShieldCheck } from "lucide-react";

// UI Components (assuming paths are correct)
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Separator } from "../../../components/ui/separator";

// Hooks & Types
import { useRepledge } from "../../../hooks/useRepledgeforclose";
import { calculateRepledgeClose, type CalculationResults } from "../../../types/RepledgeCalcForClose";
import { supabase, type CloseRepledge } from "../../../lib/supabase";

// --- Loading Skeleton Component ---
const CloseRepledgeSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
            </CardContent>
        </Card>
    </div>
);


export const CloseRepledge = (): JSX.Element => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();

    // Form Inputs State
    const [endDate, setEndDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "upi">("cash");
    const [calculationMethod, setCalculationMethod] = useState<"method_1">("method_1");

    // Calculation & Saving State
    const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { repledge, loading, error, searchRepledgeByLoanId } = useRepledge();

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
                calculationMethod,
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
        setSaveSuccess(false);

        try {
            // Data object that matches the arguments of our new SQL function
            const functionParams = {
                p_repledge_id: repledge.id,
                p_end_date: endDate,
                p_payment_method: paymentMethod,
                p_calculation_method: calculationMethod,
                p_duration: calculationResults.duration,
                p_final_interest_rate: calculationResults.finalInterestRate,
                p_calculated_interest: calculationResults.calculatedInterest,
                p_total_payable: calculationResults.totalPayable,
            };

            // NEW: Call the database function using rpc()
            // This single call performs both the insert and the update safely.
            const { error } = await supabase.rpc('close_repledge_and_update_status', functionParams);

            if (error) throw error; // If the function fails, throw an error

            // --- Success Handling ---
            setSaveSuccess(true);
            setTimeout(() => {
                navigate('/re-pledge-entry/details'); // Redirect to the repledges list page
                // navigate(-1); // Go back to the previous page
            }, 2000);

        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save and close the repledge.');
        } finally {
            setIsSaving(false);
        }
    };
    // --- Render Logic ---

    const renderContent = () => {
        if (loading) {
            return <CloseRepledgeSkeleton />;
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (!repledge) {
            return (
                <Alert>
                    <AlertDescription>No repledge details found for this loan ID.</AlertDescription>
                </Alert>
            );
        }

        return (
            <div className="space-y-6">
                {/* --- Repledge Details --- */}
                <Card className="bg-white border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Repledge Details</CardTitle>
                        <CardDescription>
                            Original Loan No: #{repledge.loan_no}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Re-Pledge No.</span>
                            <span className="font-medium text-gray-800">#{repledge.re_no}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Bank</span>
                            <span className="font-medium text-gray-800">{repledge.banks?.name || 'N/A'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Start Date</span>
                            <span className="font-medium text-gray-800">{format(new Date(repledge.start_date), 'dd MMM, yyyy')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Principle Amount</span>
                            <span className="font-medium text-gray-800">₹{repledge.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Interest Rate</span>
                            <span className="font-medium text-gray-800">{repledge.interest_percent}%</span>
                        </div>
                    </CardContent>
                </Card>

                {/* --- Calculation Inputs --- */}
                <Card className="bg-white border rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Closing Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="end-date">Closing Date</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-method">Payment Method</Label>
                            <Select onValueChange={(value: "cash" | "bank_transfer" | "upi") => setPaymentMethod(value)} defaultValue={paymentMethod}>
                                <SelectTrigger id="payment-method">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* --- Calculation Results --- */}
                {calculationResults && (
                    <Card className="bg-black text-white rounded-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Final Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Duration</span>
                                <span className="font-medium text-gray-200">{calculationResults.duration} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Calculated Interest</span>
                                <span className="font-medium text-gray-200">₹{calculationResults.calculatedInterest.toLocaleString('en-IN')}</span>
                            </div>
                            <Separator className="bg-gray-600" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-semibold text-white">Total Payable</span>
                                <span className="text-2xl font-bold text-green-400">₹{calculationResults.totalPayable.toLocaleString('en-IN')}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <main className="bg-gray-50 min-h-screen">
            <div className="w-full max-w-md mx-auto bg-gray-50">
                <header className="w-full h-10 bg-black rounded-b-3xl flex items-center justify-center relative px-4">
                    <Button
                        onClick={() => navigate(-1)}
                        size="icon"
                        variant="ghost"
                        className="absolute left-4 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-white text-xl font-bold tracking-wide">
                        Close Repledge
                    </h1>
                </header>

                <div className="p-4 sm:p-6 pb-28">
                    {saveSuccess && (
                        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                            <AlertDescription>Repledge closed successfully! Redirecting...</AlertDescription>
                        </Alert>
                    )}
                    {saveError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                    )}

                    {renderContent()}
                </div>

                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gray-50/80 backdrop-blur-sm border-t">
                    <Button
                        onClick={handleSubmit}
                        // --- LOGIC MERGED ---
                        // Combines the disabled conditions from both buttons.
                        // Assumes your main data object is 'repledge' and it has a 'status' property.
                        disabled={!repledge || !calculationResults || !endDate || isSaving || repledge?.status === 'Closed'}
                        className="w-full h-14 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
                    >
                        {/* --- FUNCTIONALITY MERGED --- */}
                        {/* Adopts the three-state display logic from the first button. */}
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin h-6 w-6 mr-3" />
                                <span>Saving...</span>
                            </>
                        ) : repledge?.status === 'Closed' ? (
                            <>
                                <ShieldCheck className="w-6 h-6 mr-3" />
                                <span>Already Closed</span>
                            </>
                        ) : (
                            "Confirm & Close"
                        )}
                    </Button>
                </div>
            </div>
        </main>
    );
};