import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, CheckCircle2, Loader2, AlertTriangle, ShieldCheck, FileText, Calculator, BarChart2 } from 'lucide-react';
import { calculateInterest, CalculationMethod } from '../../lib/calculateInterest';
import { useLoanCalculation } from "../../hooks/useLoanCalculation";


// --- Helper Components for Page States ---
const GoldCoinSpinner: React.FC<{ text?: string }> = ({ text = "Loading Loan Data..." }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
        <svg className="coin-spinner w-20 h-20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
                    <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4"/>
            <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
        </svg>
        <p className="mt-4 text-white font-semibold">{text}</p>
    </div>
);

const SuccessState: React.FC = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-sm text-center p-6 bg-white rounded-2xl shadow-xl">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Pledge Closed!</h2>
            <p className="text-slate-500 mt-2">Redirecting you back to the customer list...</p>
        </Card>
    </div>
);

const ErrorState: React.FC<{ error: string, onBack: () => void }> = ({ error, onBack }) => (
     <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-sm text-center p-6 bg-white rounded-2xl shadow-xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">An Error Occurred</h2>
            <p className="text-slate-500 mt-2 break-words">{error}</p>
            <Button onClick={onBack} className="mt-6 w-full"><ArrowLeft className="w-4 h-4 mr-2" />Go Back</Button>
        </Card>
    </div>
);

// --- Main ClosePledge Component ---
export const ClosePledge: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const { loanData, loading, error, saving, saveCalculationAndCloseLoan } = useLoanCalculation(loanId || null);

    const [selectedMethod, setSelectedMethod] = useState<CalculationMethod>('method1');
    const [toDate, setToDate] = useState('');
    const [reductionAmount, setReductionAmount] = useState(0);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setToDate(today);
    }, []);

    const handleClosePledge = async () => {
        if (!loanData || !toDate) return;
        const result = calculateInterest(selectedMethod, loanData.date, toDate, loanData.amount, loanData.interest_rate, loanData.validity_months, loanData.interest_taken ? 'taken' : 'notTaken', reductionAmount);
        const success = await saveCalculationAndCloseLoan(toDate, reductionAmount, selectedMethod, result);
        if (success) {
            setShowSuccessMessage(true);
            setTimeout(() => navigate('/customers'), 2000);
        }
    };

    if (loading) return <GoldCoinSpinner />;
    if (showSuccessMessage) return <SuccessState />;
    if (error || !loanData) return <ErrorState error={error || 'Loan data could not be found.'} onBack={() => navigate('/customers')} />;

    const result = calculateInterest(selectedMethod, loanData.date, toDate, loanData.amount, loanData.interest_rate, loanData.validity_months, loanData.interest_taken ? 'taken' : 'notTaken', reductionAmount);

    const methodOptions = [
        { value: 'method1', label: 'Scheme 1 (Maximum)' },
        { value: 'method2', label: 'Scheme 2 (Minimum)' },
        { value: 'method3', label: 'Scheme 3 (Medium)' },
        { value: 'method4', label: 'Scheme 4 (Days)' },
    ];
    
    const InfoRow = ({ label, value, valueClass = 'text-slate-800' }: { label: string, value: React.ReactNode, valueClass?: string }) => (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">{label}</span>
            <span className={`font-medium ${valueClass}`}>{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
                <header className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/view-pledge/${loanId}`)} className="rounded-full h-10 w-10">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Close Pledge</h1>
                        {/* <p className="text-sm text-slate-500">Calculate final amount for Loan #{loanData.loan_no}</p> */}
                    </div>
                </header>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText size={18}/> Loan Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <InfoRow label="Loan No" value={loanData.loan_no} />
                        <InfoRow label="Principal Amount" value={`₹${loanData.amount.toLocaleString('en-IN')}`} />
                        <InfoRow label="Start Date" value={new Date(loanData.date).toLocaleDateString('en-GB')} />
                        <InfoRow label="Interest Rate" value={`${loanData.interest_rate}% / month`} />
                        <InfoRow label="Validity" value={`${loanData.validity_months} months`} />
                        <InfoRow label="Status" value={loanData.status} valueClass={loanData.status === 'Closed' ? 'text-red-600' : 'text-green-600'} />
                        <InfoRow label="Interest Paid" value={loanData.interest_taken ? 'Yes' : 'No'} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calculator size={18}/> Calculation Inputs</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reduction Amount (₹)</label>
                            <input type="number" value={reductionAmount} onChange={(e) => setReductionAmount(Number(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g., 500" min="0" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Calculation Method</label>
                            <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value as CalculationMethod)} className="w-full px-3 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 appearance-none">
                                {methodOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart2 size={18}/> Calculation Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow label="Duration" value={result.totalMonths} />
                        <InfoRow label="Final Interest Rate" value={result.finalInterestRate} />
                        <div className="border-t border-slate-100 !my-3"></div>
                        <InfoRow label="Calculated Interest" value={`₹${result.totalInterest.toLocaleString('en-IN')}`} />
                        {result.interestReduction > 0 && (
                            <InfoRow label="Interest Reduced" value={`- ₹${result.interestReduction.toLocaleString('en-IN')}`} valueClass="text-red-500"/>
                        )}
                        {result.additionalReduction > 0 && (
                             <InfoRow label="Additional Reduction" value={`- ₹${result.additionalReduction.toLocaleString('en-IN')}`} valueClass="text-red-500"/>
                        )}
                        <div className="border-t border-slate-200 !my-3"></div>
                        <div className="flex justify-between items-center text-xl font-bold text-green-600 p-3 bg-green-50 rounded-lg">
                            <span>Total Payable</span>
                            <span>₹{result.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-2">
                    <Button
                        onClick={handleClosePledge}
                        disabled={saving || loanData.status === 'Closed' || !toDate}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-base font-semibold rounded-xl transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {saving ? (
                            <><Loader2 className="animate-spin h-5 w-5 mr-2" /><span>Closing Pledge...</span></>
                        ) : loanData.status === 'Closed' ? (
                            <><ShieldCheck className="w-5 h-5 mr-2" /><span>Pledge Already Closed</span></>
                        ) : (
                            <><CheckCircle2 className="w-5 h-5 mr-2" /><span>Confirm & Close Pledge</span></>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};