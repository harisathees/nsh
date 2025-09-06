import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase"; // Ensure you have this import
import { Building2Icon, SearchIcon, PlusIcon, TrashIcon, SettingsIcon, CalendarIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label"; // --- IMPORTED Label ---
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { useRepledge } from "../../../hooks/useRepledge";
import { useBanks } from "../../../hooks/useBank";
import { format, addMonths } from "date-fns";
import toast from "react-hot-toast"; // Added for better feedback

// ---------------------- TYPES ----------------------
interface RepledgeFormData {
  loanId: string;
  loanNo: string;
  reNo: string;
  netWeight: number;
  grossWeight: number;
  stoneWeight: number;
  amount: number;
  processingFee: number;
  bankId: string;
  interestPercent: number;
  validityPeriod: number;
  afterInterestPercent: number;
  paymentMethod: string;
  dueDate: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface LoanSuggestion {
  loan_no: string;
  amount: number;
  status: string;
}

interface FormTemplateData {
  bankId: string;
  interestPercent: number;
  validityPeriod: number;
  afterInterestPercent: number;
  paymentMethod: string;
  startDate: string;
}

const isLoanAlreadyRepledged = async (loanNo: string): Promise<boolean> => {
  if (!loanNo) return false;
  try {
    const { data, error } = await supabase
      .from('repledge_entries')
      .select('loan_no')
      .eq('loan_no', loanNo)
      .limit(1);

    if (error) {
      console.error("Error checking repledge status:", error);
      return false;
    }
    return data.length > 0;
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return false;
  }
};

// ---------------------- MAIN COMPONENT ----------------------
export const RePledge = (): JSX.Element => {
  const {
    loading,
    error,
    repledgeEntries,
    currentPage,
    totalPages,
    fetchLoanDetails,
    saveRepledgeEntry,
    deleteRepledgeEntry,
    searchLoanSuggestions,
    setCurrentPage,
  } = useRepledge();

  const { banks, loading: banksLoading, createBank } = useBanks();



  const [formTemplate, setFormTemplate] = useState<FormTemplateData>({
    bankId: "",
    interestPercent: 0,
    validityPeriod: 0,
    afterInterestPercent: 0,
    paymentMethod: "",
    startDate: "",
  });

const initialFormState: RepledgeFormData = {
  loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0,
  stoneWeight: 0, amount: 0, processingFee: 0, bankId: "",
  interestPercent: 0, validityPeriod: 0, afterInterestPercent: 0,
  paymentMethod: "", dueDate: "", startDate: "", endDate: "",
  status: "active", 
};

  const [forms, setForms] = useState<RepledgeFormData[]>([initialFormState]);
  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false);
  const [showBankManagement, setShowBankManagement] = useState(false);

  const [repledgeError, setRepledgeError] = useState('');

  const currentForm = forms[activeFormIndex] || initialFormState;
  // ---------------------- EFFECTS ----------------------
  useEffect(() => {
    const currentLoanNo = forms[activeFormIndex]?.loanNo || "";
    setSearchQuery(currentLoanNo);
    setShowSuggestions(false);
  }, [activeFormIndex, forms]);

  useEffect(() => {
    const activeForm = forms[activeFormIndex];
    if (activeForm) {
      setFormTemplate({
        bankId: activeForm.bankId,
        interestPercent: activeForm.interestPercent,
        validityPeriod: activeForm.validityPeriod,
        afterInterestPercent: activeForm.afterInterestPercent,
        paymentMethod: activeForm.paymentMethod,
        startDate: activeForm.startDate,
      });
    }
  }, [forms, activeFormIndex]);

  useEffect(() => {
    if (isSuggestionSelected) return;
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const results = await searchLoanSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isSuggestionSelected, searchLoanSuggestions]);

  useEffect(() => {
    if (currentForm && currentForm.startDate && currentForm.validityPeriod > 0) {
      try {
        const start = new Date(currentForm.startDate);
        const end = addMonths(start, currentForm.validityPeriod);
        const formattedEndDate = format(end, "yyyy-MM-dd");
        if (formattedEndDate !== currentForm.endDate) {
          updateFormData(activeFormIndex, "endDate", formattedEndDate);
        }
      } catch (e) {
        console.error("Invalid date for calculation", e);
      }
    }
  }, [currentForm?.startDate, currentForm?.validityPeriod, activeFormIndex]);


  // ---------------------- HANDLERS ----------------------
  const handleBankSelectionChange = (bankId: string) => {
    const selectedBank = banks.find(b => b.id === bankId);
    setForms(currentForms => {
      const newForms = [...currentForms];
      const formToUpdate = { ...newForms[activeFormIndex] };
      formToUpdate.bankId = bankId;
      if (selectedBank) {
        formToUpdate.interestPercent = selectedBank.default_interest || 0;
        formToUpdate.validityPeriod = selectedBank.validity_months || 0;
        formToUpdate.afterInterestPercent = selectedBank.post_validity_interest || 0;
        formToUpdate.paymentMethod = selectedBank.payment_method || "";
      } else {
        formToUpdate.interestPercent = 0;
        formToUpdate.validityPeriod = 0;
        formToUpdate.afterInterestPercent = 0;
        formToUpdate.paymentMethod = "";
      }
      newForms[activeFormIndex] = formToUpdate;
      return newForms;
    });
  };

  const handleLoanSearch = async (loanNo: string) => {
    if (!loanNo.trim()) return;

    // Clear previous errors before starting a new search
    setRepledgeError('');

    const isRepledged = await isLoanAlreadyRepledged(loanNo);

    if (isRepledged) {
      // If the loan is already repledged, set an error and stop.
      const errorMessage = `Loan ${loanNo} has already been repledged.`;
      setRepledgeError(errorMessage);
      toast.error(errorMessage);
      return; // Exit the function
    }

    // If the check passes, proceed with your original logic
    const result = await fetchLoanDetails(loanNo);
    if (result) {
      const updatedForms = [...forms];
      updatedForms[activeFormIndex] = {
        ...updatedForms[activeFormIndex],
        loanId: result.loan.id,
        loanNo: result.loan.loan_no,
        netWeight: result.totals.net_weight,
        grossWeight: result.totals.gross_weight,
        stoneWeight: result.totals.stone_weight,
        amount: result.loan.amount,
        processingFee: result.loan.processing_fee,
      };
      setForms(updatedForms);
      toast.success(`Loaded details for loan ${result.loan.loan_no}`);
    } else {
      toast.error(`Loan number ${loanNo} not found.`);
    }
  };

  const addNewForm = () => {
    const newForm: RepledgeFormData = {
      ...initialFormState,
      ...formTemplate,
    };
    setForms([...forms, newForm]);
    setActiveFormIndex(forms.length);
    setSearchQuery("");
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const updatedForms = forms.filter((_, i) => i !== index);
      setForms(updatedForms);
      if (activeFormIndex >= updatedForms.length) {
        setActiveFormIndex(updatedForms.length - 1);
      }
    }
  };

  const updateFormData = (index: number, field: keyof RepledgeFormData, value: any) => {
    const updatedForms = [...forms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setForms(updatedForms);
  };

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank ? bank.name : "N/A";
  };

  const handleSave = async () => {
    const promise = Promise.all(forms.map(form => {
      if (form.loanNo && form.reNo) {
        return saveRepledgeEntry({
          loan_id: form.loanId || null,
          loan_no: form.loanNo,
          re_no: form.reNo,
          net_weight: form.netWeight,
          gross_weight: form.grossWeight,
          stone_weight: form.stoneWeight,
          amount: form.amount,
          processing_fee: form.processingFee,
          bank_id: form.bankId || null,
          interest_percent: form.interestPercent,
          validity_period: form.validityPeriod,
          after_interest_percent: form.afterInterestPercent,
          payment_method: form.paymentMethod || null,
          start_date: form.startDate || null,
          end_date: form.endDate || null,
          due_date: form.dueDate || null,
          status: form.status || "active",
        });
      }
      return Promise.resolve();
    }));

    toast.promise(promise, {
      loading: 'Saving entries...',
      success: 'All entries saved successfully!',
      error: 'Could not save entries.',
    });

    try {
      await promise;
      setForms([initialFormState]);
      setActiveFormIndex(0);
      setSearchQuery("");
    } catch (e) {
      console.error("Save failed:", e);
    }
  };


  const handleDelete = async (id: string) => {
    const promise = deleteRepledgeEntry(id);
    toast.promise(promise, {
      loading: 'Deleting entry...',
      success: 'Entry deleted successfully!',
      error: 'Failed to delete entry.'
    });
  };

  // ---------------------- RENDER ----------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white shadow-sm">
        <header className="w-full h-20 bg-black rounded-b-3xl flex items-center justify-center relative px-4">
          <h1 className="text-white text-xl font-bold tracking-wide">Re-Pledge Entry</h1>
          <Button
            onClick={() => setShowBankManagement(true)}
            size="icon"
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white"
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </header>

        <div className="p-2 space-y-6">
          {/* --- Bank & Details Section --- */}
          <Card className="bg-white border rounded-lg">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bank-select">Bank</Label>
                <Select value={currentForm.bankId} onValueChange={handleBankSelectionChange}>
                  <SelectTrigger id="bank-select" className="w-full h-11 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2Icon className="w-5 h-5 text-gray-500" />
                      <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select a bank"} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex flex-col">
                          <span>{bank.name}</span>
                          {bank.branch && <span className="text-xs text-gray-500">{bank.branch}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="interest">Interest %</Label>
                  <Input id="interest" type="number" placeholder="e.g. 12" value={currentForm.interestPercent || ""} onChange={(e) => updateFormData(activeFormIndex, "interestPercent", parseFloat(e.target.value) || 0)} className="h-10 bg-gray-50 rounded-lg text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="validity">Validity (Mo)</Label>
                  <Input id="validity" type="number" placeholder="e.g. 6" value={currentForm.validityPeriod || ""} onChange={(e) => updateFormData(activeFormIndex, "validityPeriod", parseInt(e.target.value) || 0)} className="h-10 bg-gray-50 rounded-lg text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="after-interest">Post-Int %</Label>
                  <Input id="after-interest" type="number" placeholder="e.g. 18" value={currentForm.afterInterestPercent || ""} onChange={(e) => updateFormData(activeFormIndex, "afterInterestPercent", parseFloat(e.target.value) || 0)} className="h-10 bg-gray-50 rounded-lg text-center" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="payment-method">Payment</Label>
                  <Input id="payment-method" placeholder="e.g. Cash" value={currentForm.paymentMethod} onChange={(e) => updateFormData(activeFormIndex, "paymentMethod", e.target.value)} className="h-10 bg-gray-50 rounded-lg text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" value={currentForm.startDate} onChange={(e) => updateFormData(activeFormIndex, "startDate", e.target.value)} className="h-10 bg-gray-50 rounded-lg text-center" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" value={currentForm.endDate} readOnly className="h-10 bg-gray-200 rounded-lg text-center text-gray-600 cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-gray-200">Status</Label>
                    <Select
                     value={currentForm.status}
                     onValueChange={(value) => updateFormData(activeFormIndex, "status", value)}
                    >
                    <SelectTrigger id="status" className="bg-gray-200 text-black rounded-lg h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* --- Loan Details Card --- */}
          <Card className="bg-black text-white rounded-xl shadow-lg">
            <CardContent className="p-4 space-y-4">
              {forms.length > 1 && (
                <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                  {/* To this line */}
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-2">                    <Label className="text-sm text-gray-400">Forms:</Label>
                    {forms.map((_, index) => (
                      <button key={index} onClick={() => setActiveFormIndex(index)} className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${activeFormIndex === index ? 'bg-white text-black' : 'bg-gray-600 text-white hover:bg-gray-500'}`}>
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <Button onClick={() => removeForm(activeFormIndex)} size="icon" variant="destructive" className="h-7 w-7">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="relative space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="loan-no-search" className="text-gray-300">Original Loan No.</Label>
                  <div className="relative">
                    <div className="flex items-center bg-white rounded-lg p-1">
                      <Input id="loan-no-search" placeholder="Search by Ln.no" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setIsSuggestionSelected(false); setRepledgeError(''); }} className="border-0 bg-transparent text-black text-sm flex-1 h-8 p-2 focus-visible:ring-0 focus-visible:ring-offset-0" />
                      <Button onClick={() => handleLoanSearch(searchQuery)} size="icon" aria-label="Search" className="h-8 w-8 bg-gray-200 text-gray-700 hover:bg-gray-300 shrink-0">
                        <SearchIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                        {/* Suggestions logic remains the same */}
                        {loading ? (<div className="p-3 text-sm text-gray-500 text-center">Searching...</div>) : suggestions.length > 0 ? (
                          suggestions.map((suggestion) => (
                            <button key={suggestion.loan_no} onClick={() => { setIsSuggestionSelected(true); setSearchQuery(suggestion.loan_no); handleLoanSearch(suggestion.loan_no); setShowSuggestions(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-black">{suggestion.loan_no}</div>
                                  <div className="text-gray-500 text-xs capitalize">{suggestion.status}</div>
                                </div>
                                <div className="font-mono text-xs text-gray-600">₹{suggestion.amount}</div>
                              </div>
                            </button>
                          ))
                        ) : (<div className="p-3 text-sm text-gray-500 text-center">No results found.</div>)}
                      </div>
                    )}
                  </div>
                  {repledgeError && <p className="text-red-400 text-sm mt-1">{repledgeError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="re-no" className="text-gray-300">Re-Pledge No.</Label>
                  <Input id="re-no" placeholder="Ente re-pledge number" value={currentForm.reNo} onChange={(e) => updateFormData(activeFormIndex, 'reNo', e.target.value)} className="bg-white text-black rounded-lg h-10" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="gross-weight" className="text-gray-300">Gross Wt.</Label>
                    <Input id="gross-weight" type="number" placeholder="g" value={currentForm.grossWeight || ""} onChange={(e) => updateFormData(activeFormIndex, 'grossWeight', parseFloat(e.target.value) || 0)} className="bg-white text-black rounded-lg text-center" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stone-weight" className="text-gray-300">Stone Wt.</Label>
                    <Input id="stone-weight" type="number" placeholder="g" value={currentForm.stoneWeight || ""} onChange={(e) => updateFormData(activeFormIndex, 'stoneWeight', parseFloat(e.target.value) || 0)} className="bg-white text-black rounded-lg text-center" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="net-weight" className="text-gray-300">Net Wt.</Label>
                    <Input id="net-weight" type="number" placeholder="g" value={currentForm.netWeight || ""} onChange={(e) => updateFormData(activeFormIndex, 'netWeight', parseFloat(e.target.value) || 0)} className="bg-white text-black rounded-lg text-center" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                    <Input id="amount" type="number" placeholder="₹" value={currentForm.amount || ""} onChange={(e) => updateFormData(activeFormIndex, 'amount', parseFloat(e.target.value) || 0)} className="bg-white text-black rounded-lg text-center" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proc-fee" className="text-gray-300">Proc. Fee</Label>
                    <Input id="proc-fee" type="number" placeholder="₹" value={currentForm.processingFee || ""} onChange={(e) => updateFormData(activeFormIndex, 'processingFee', parseFloat(e.target.value) || 0)} className="bg-white text-black rounded-lg text-center" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-2">
            <Button onClick={addNewForm} variant="outline" className="rounded-full h-10 px-4 flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add Another
            </Button>
            <Button onClick={handleSave} disabled={loading} className="w-32 h-10 bg-black rounded-full text-white font-semibold text-base">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {/* --- Recent Entries --- */}
          {repledgeEntries.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-800 px-1">Recent Entries</h3>
              {repledgeEntries.map((entry) => (
                <Card key={entry.id} className="p-3 bg-gray-100/70 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-gray-800">{entry.loan_no} &rarr; {entry.re_no}</p>
                      <p className="text-gray-600">
                        <span className="font-medium">Bank:</span> {getBankName(entry.bank_id)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Amount:</span> ₹{entry.amount} | <span className="font-medium">Fee:</span> ₹{entry.processing_fee} 
                      </p>
                      <p className="text-gray-600"> <span className="font-medium">Status:</span> {entry.status}
                      </p>
                      <p className="text-xs text-gray-500 pt-1">
                        {format(new Date(entry.created_at), 'dd MMM, yyyy')}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        {/* <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 hover:text-red-600 h-8 w-8">
                           <TrashIcon className="w-4 h-4" />
                        </Button> */}
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the re-pledge entry for loan "{entry.loan_no}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogTrigger asChild><Button variant="outline">Cancel</Button></DialogTrigger>
                          <Button variant="destructive" onClick={() => handleDelete(entry.id)}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}



          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <Dialog open={showBankManagement} onOpenChange={setShowBankManagement}>
            {/* --- Bank Management Dialog ---  */}
            {/* The UI for this can also be improved with Labels, but is kept the same for brevity */}
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bank Management</DialogTitle>
                <DialogDescription>
                  {/* Manage your banks here. You can add, edit, or remove banks. */}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <QuickAddBankForm onBankAdded={() => {
                  toast.success("New bank added!");
                  // You might want to refetch banks here if your useBanks hook doesn't do it automatically
                }} createBank={createBank} loading={loading} />

                <div className="space-y-2">
                  <h4 className="font-medium">Available Banks</h4>
                  {banksLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : banks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No banks found</div>
                  ) : (
                    <div className="space-y-2">
                      {banks.map((bank) => (
                        <div key={bank.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                          <div>
                            <div className="font-medium text-gray-800">{bank.name}</div>
                            {bank.branch && <div className="text-xs text-gray-500">{bank.branch}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBankManagement(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};


// ---------------------- QUICK ADD BANK FORM (with Label improvements) ----------------------
const QuickAddBankForm = ({ onBankAdded, createBank, loading }: { onBankAdded: () => void, createBank: Function, loading: boolean }) => {

  const [formData, setFormData] = useState({
    name: '', code: '', branch: '', defaultInterest: '',
    validityMonths: '', postValidityInterest: '', paymentMethod: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Bank name is required.");
      return;
    }
    await createBank(formData);
    setFormData({ name: '', code: '', branch: '', defaultInterest: '', validityMonths: '', postValidityInterest: '', paymentMethod: '' });
    onBankAdded();
  };


  return (
    <div className="border rounded-lg p-2 bg-gray-50/50">
      <h4 className="font-semibold mb-3 text-gray-800">Quick Add Bank</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="q-bank-name">Bank Name *</Label>
          <Input id="q-bank-name" placeholder="e.g. State Bank of India" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="q-bank-code">Bank Code</Label>
            <Input id="q-bank-code" placeholder="Optional" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-branch">Branch Name</Label>
            <Input id="q-branch" placeholder="Optional" value={formData.branch} onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="q-interest">Interest %</Label>
            <Input id="q-interest" type="number" placeholder="e.g. 12" value={formData.defaultInterest} onChange={(e) => setFormData(prev => ({ ...prev, defaultInterest: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-validity">Validity (Months)</Label>
            <Input id="q-validity" type="number" placeholder="e.g. 6" value={formData.validityMonths} onChange={(e) => setFormData(prev => ({ ...prev, validityMonths: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="q-post-interest">Interest % after validity</Label>
          <Input id="q-post-interest" type="number" placeholder="e.g. 18" value={formData.postValidityInterest} onChange={(e) => setFormData(prev => ({ ...prev, postValidityInterest: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="q-payment">Default Payment Method</Label>
          <Input id="q-payment" placeholder="e.g. Online" value={formData.paymentMethod} onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} />
        </div>
        <Button type="submit" disabled={loading || !formData.name.trim()} className="w-full h-10 bg-black text-white">
          {loading ? 'Adding...' : 'Add Bank'}
        </Button>
      </form>
    </div>
  );
};