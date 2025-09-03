
// import React, { useState, useEffect } from "react";
// import { Building2Icon, SearchIcon, PlusIcon, TrashIcon, SettingsIcon, Landmark, FileText, Banknote } from "lucide-react";
// import { Button } from "../../components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogClose // Import DialogClose
// } from "../../components/ui/dialog";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "../../components/ui/pagination";
// import { useRepledge } from "../../hooks/useRepledge";
// import { useBanks } from "../../hooks/useBank";
// import { format, addMonths } from "date-fns";
// import { cn } from "../../lib/utils"; // Assuming you have a cn utility for classnames

// // ---------------------- TYPES ----------------------
// interface RepledgeFormData {
//   loanId: string;
//   loanNo: string;
//   reNo: string;
//   netWeight: number;
//   grossWeight: number;
//   stoneWeight: number;
//   amount: number;
//   processingFee: number;
//   bankId: string;
//   interestPercent: number;
//   validityPeriod: number;
//   afterInterestPercent: number;
//   paymentMethod: string;
//   dueDate: string;
//   startDate: string;
//   endDate: string;
// }

// interface LoanSuggestion {
//   loan_no: string;
//   amount: number;
//   status: string;
// }

// interface FormTemplateData {
//   bankId: string;
//   interestPercent: number;
//   validityPeriod: number;
//   afterInterestPercent: number;
//   paymentMethod: string;
//   startDate: string;
// }

// // ---------------------- MAIN COMPONENT ----------------------
// export const RePledge = (): JSX.Element => {
//   const {
//     loading,
//     error,
//     repledgeEntries,
//     currentPage,
//     totalPages,
//     fetchLoanDetails,
//     saveRepledgeEntry,
//     deleteRepledgeEntry,
//     searchLoanSuggestions,
//     setCurrentPage,
//   } = useRepledge();

//   const { banks, loading: banksLoading } = useBanks();

//   const [formTemplate, setFormTemplate] = useState<FormTemplateData>({
//     bankId: "",
//     interestPercent: 0,
//     validityPeriod: 0,
//     afterInterestPercent: 0,
//     paymentMethod: "",
//     startDate: "",
//   });

//   const [forms, setForms] = useState<RepledgeFormData[]>([{
//     loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0, stoneWeight: 0,
//     amount: 0, processingFee: 0, bankId: "", interestPercent: 0, validityPeriod: 0,
//     afterInterestPercent: 0, paymentMethod: "", dueDate: "", startDate: "", endDate: "",
//   }]);

//   const [activeFormIndex, setActiveFormIndex] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [isSuggestionSelected, setIsSuggestionSelected] = useState(false);
//   const [showBankManagement, setShowBankManagement] = useState(false);

//   const currentForm = forms[activeFormIndex];

//   // ---------------------- HANDLERS ----------------------
//   const handleBankSelectionChange = (bankId: string) => {
//     const selectedBank = banks.find(b => b.id === bankId);
//     setForms(currentForms => {
//       const newForms = [...currentForms];
//       const formToUpdate = { ...newForms[activeFormIndex] };
//       formToUpdate.bankId = bankId;
//       if (selectedBank) {
//         formToUpdate.interestPercent = selectedBank.default_interest || 0;
//         formToUpdate.validityPeriod = selectedBank.validity_months || 0;
//         formToUpdate.afterInterestPercent = selectedBank.post_validity_interest || 0;
//         formToUpdate.paymentMethod = selectedBank.payment_method || "";
//       } else {
//         formToUpdate.interestPercent = 0;
//         formToUpdate.validityPeriod = 0;
//         formToUpdate.afterInterestPercent = 0;
//         formToUpdate.paymentMethod = "";
//       }
//       newForms[activeFormIndex] = formToUpdate;
//       return newForms;
//     });
//   };

//   // ---------------------- EFFECTS ----------------------
//   useEffect(() => {
//     const currentLoanNo = forms[activeFormIndex]?.loanNo || "";
//     setSearchQuery(currentLoanNo);
//     setShowSuggestions(false);
//   }, [activeFormIndex, forms]);

//   useEffect(() => {
//     const activeForm = forms[activeFormIndex];
//     if (activeForm) {
//       setFormTemplate({
//         bankId: activeForm.bankId,
//         interestPercent: activeForm.interestPercent,
//         validityPeriod: activeForm.validityPeriod,
//         afterInterestPercent: activeForm.afterInterestPercent,
//         paymentMethod: activeForm.paymentMethod,
//         startDate: activeForm.startDate,
//       });
//     }
//   }, [forms, activeFormIndex]);

//   useEffect(() => {
//     if (isSuggestionSelected) return;
//     const debounceTimer = setTimeout(async () => {
//       if (searchQuery.length >= 2) {
//         const results = await searchLoanSuggestions(searchQuery);
//         setSuggestions(results);
//         setShowSuggestions(true);
//       } else {
//         setSuggestions([]);
//         setShowSuggestions(false);
//       }
//     }, 300);
//     return () => clearTimeout(debounceTimer);
//   }, [searchQuery, isSuggestionSelected, searchLoanSuggestions]);

//   useEffect(() => {
//     if (currentForm && currentForm.startDate && currentForm.validityPeriod > 0) {
//       try {
//         const start = new Date(currentForm.startDate);
//         const end = addMonths(start, currentForm.validityPeriod);
//         const formattedEndDate = format(end, "yyyy-MM-dd");
//         if (formattedEndDate !== currentForm.endDate) {
//           updateFormData(activeFormIndex, "endDate", formattedEndDate);
//         }
//       } catch (e) {
//         console.error("Invalid date for calculation", e);
//       }
//     }
//   }, [currentForm?.startDate, currentForm?.validityPeriod, activeFormIndex]);

//   // ---------------------- HANDLERS ----------------------
//   const handleLoanSearch = async (loanNo: string) => {
//     if (!loanNo.trim()) return;
//     const result = await fetchLoanDetails(loanNo);
//     if (result) {
//       const updatedForms = [...forms];
//       updatedForms[activeFormIndex] = {
//         ...updatedForms[activeFormIndex],
//         loanId: result.loan.id,
//         loanNo: result.loan.loan_no,
//         netWeight: result.totals.net_weight,
//         grossWeight: result.totals.gross_weight,
//         stoneWeight: result.totals.stone_weight,
//         amount: result.loan.amount,
//         processingFee: result.loan.processing_fee,
//       };
//       setForms(updatedForms);
//     }
//   };

//   const addNewForm = () => {
//     const newForm: RepledgeFormData = {
//       loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0, stoneWeight: 0,
//       amount: 0, processingFee: 0, dueDate: "", endDate: "",
//       ...formTemplate,
//     };
//     setForms([...forms, newForm]);
//     setActiveFormIndex(forms.length);
//     setSearchQuery("");
//   };

//   const removeForm = (index: number) => {
//     if (forms.length > 1) {
//       const updatedForms = forms.filter((_, i) => i !== index);
//       setForms(updatedForms);
//       if (activeFormIndex >= updatedForms.length) {
//         setActiveFormIndex(updatedForms.length - 1);
//       }
//     }
//   };

//   const updateFormData = (index: number, field: keyof RepledgeFormData, value: any) => {
//     const updatedForms = [...forms];
//     updatedForms[index] = { ...updatedForms[index], [field]: value };
//     setForms(updatedForms);
//   };

//   const getBankName = (bankId: string) => {
//     return banks.find(b => b.id === bankId)?.name || "N/A";
//   };

//   const handleSave = async () => {
//     for (const form of forms) {
//       if (form.loanNo && form.reNo) {
//         await saveRepledgeEntry({
//           loan_id: form.loanId || null,
//           loan_no: form.loanNo, re_no: form.reNo, net_weight: form.netWeight,
//           gross_weight: form.grossWeight, stone_weight: form.stoneWeight, amount: form.amount,
//           processing_fee: form.processingFee, bank_id: form.bankId || null, interest_percent: form.interestPercent,
//           validity_period: form.validityPeriod, after_interest_percent: form.afterInterestPercent,
//           payment_method: form.paymentMethod || null, start_date: form.startDate || null,
//           end_date: form.endDate || null, due_date: form.dueDate || null,
//         });
//       }
//     }
//     setForms([{
//       loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0, stoneWeight: 0,
//       amount: 0, processingFee: 0, bankId: "", interestPercent: 0, validityPeriod: 0,
//       afterInterestPercent: 0, paymentMethod: "", dueDate: "", startDate: "", endDate: "",
//     }]);
//     setActiveFormIndex(0);
//   };

//   const handleDelete = async (id: string) => {
//     await deleteRepledgeEntry(id);
//   };

//   // ---------------------- RENDER ----------------------
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-md mx-auto bg-gray-50 pb-10">
//         <header className="w-full h-[73px] bg-black rounded-b-[40px] flex items-center justify-center relative shadow-lg">
//           <h1 className="text-white text-xl font-bold tracking-wide">Re-Pledge Entry</h1>
//           <Button
//             onClick={() => setShowBankManagement(true)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 p-2 rounded-full h-10 w-10"
//           >
//             <SettingsIcon className="w-5 h-5 text-white" />
//           </Button>
//         </header>

//         <div className="p-4 space-y-6">
//           {/* === UI ENHANCEMENT: Grouped bank settings into a card === */}
//           <Card className="overflow-hidden shadow-sm">
//             <CardHeader className="bg-gray-100">
//               <CardTitle className="text-base font-semibold flex items-center gap-2">
//                 <Landmark className="w-5 h-5" />
//                 1. Bank & Loan Defaults
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 space-y-4">
//               <div className="space-y-1.5">
//                 <Label htmlFor="bank-select">Bank</Label>
//                 <Select value={currentForm.bankId} onValueChange={handleBankSelectionChange}>
//                   <SelectTrigger id="bank-select" className="w-full">
//                     <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select a bank"} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {banks.map((bank) => (
//                       <SelectItem key={bank.id} value={bank.id}>
//                         {bank.name} {bank.branch && `(${bank.branch})`}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-3 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="interest">Interest %</Label>
//                   <Input id="interest" type="number" placeholder="e.g., 12" value={currentForm.interestPercent || ""} onChange={(e) => updateFormData(activeFormIndex, "interestPercent", parseFloat(e.target.value) || 0)} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="validity">Validity (M)</Label>
//                   <Input id="validity" type="number" placeholder="e.g., 6" value={currentForm.validityPeriod || ""} onChange={(e) => updateFormData(activeFormIndex, "validityPeriod", parseInt(e.target.value) || 0)} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="post-interest">Post-Int %</Label>
//                   <Input id="post-interest" type="number" placeholder="e.g., 15" value={currentForm.afterInterestPercent || ""} onChange={(e) => updateFormData(activeFormIndex, "afterInterestPercent", parseFloat(e.target.value) || 0)} />
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="payment-method">Payment</Label>
//                   <Input id="payment-method" type="text" placeholder="e.g., Cash" value={currentForm.paymentMethod} onChange={(e) => updateFormData(activeFormIndex, "paymentMethod", e.target.value)} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="start-date">Start Date</Label>
//                   <Input id="start-date" type="date" value={currentForm.startDate} onChange={(e) => updateFormData(activeFormIndex, "startDate", e.target.value)} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="end-date">End Date</Label>
//                   <Input id="end-date" type="date" value={currentForm.endDate} readOnly className="bg-gray-100 cursor-not-allowed" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* === UI ENHANCEMENT: Main loan entry form in a separate card === */}
//           <Card className="shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-base font-semibold flex items-center gap-2">
//                 <FileText className="w-5 h-5" />
//                 2. Re-Pledge Loan Details
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4 pt-0 space-y-4">
//               {forms.length > 1 && (
//                 <div className="flex items-center justify-between pb-4 border-b">
//                   <div className="flex gap-2">
//                     {forms.map((_, index) => (
//                       <button key={index} onClick={() => setActiveFormIndex(index)} className={cn("w-8 h-8 rounded-md text-sm font-semibold transition-colors", activeFormIndex === index ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>
//                         {index + 1}
//                       </button>
//                     ))}
//                   </div>
//                    <Button onClick={() => removeForm(activeFormIndex)} size="icon" variant="ghost" className="text-red-500 hover:bg-red-50 h-8 w-8">
//                       <TrashIcon className="w-4 h-4" />
//                    </Button>
//                 </div>
//               )}

//               <div className="relative space-y-4">
//                  <div className="space-y-1.5">
//                    <Label htmlFor="loan-search">Search Original Loan No.</Label>
//                    <div className="relative">
//                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                      <Input id="loan-search" placeholder="Search by Ln.No to auto-fill" value={searchQuery}
//                        onChange={(e) => {
//                          setSearchQuery(e.target.value);
//                          setIsSuggestionSelected(false);
//                        }}
//                        className="pl-9"
//                      />
//                    </div>
//                     {showSuggestions && (
//                        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
//                          {loading ? <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
//                            : suggestions.length > 0 ? (
//                              suggestions.map((suggestion) => (
//                                <button key={suggestion.loan_no}
//                                  onClick={() => {
//                                    setIsSuggestionSelected(true);
//                                    setSearchQuery(suggestion.loan_no);
//                                    handleLoanSearch(suggestion.loan_no);
//                                    setShowSuggestions(false);
//                                  }}
//                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
//                                >
//                                  <div className="flex justify-between items-center">
//                                    <div>
//                                      <div className="font-medium text-black">{suggestion.loan_no}</div>
//                                      <div className="text-gray-500 text-xs capitalize">{suggestion.status}</div>
//                                    </div>
//                                    <div className="font-mono text-xs text-gray-600">₹{suggestion.amount}</div>
//                                  </div>
//                                </button>
//                              ))
//                            ) : <div className="p-3 text-sm text-gray-500 text-center">No results found.</div>
//                          }
//                        </div>
//                     )}
//                  </div>

//                  <div className="space-y-1.5">
//                     <Label htmlFor="re-no">New Re-Pledge No.</Label>
//                     <Input id="re-no" placeholder="Enter new Re.No" value={currentForm.reNo} onChange={(e) => updateFormData(activeFormIndex, 'reNo', e.target.value)} />
//                  </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   <div className="space-y-1.5">
//                     <Label htmlFor="gross-weight">Gross Wt.</Label>
//                     <Input id="gross-weight" type="number" placeholder="0.00" value={currentForm.grossWeight || ""} onChange={(e) => updateFormData(activeFormIndex, 'grossWeight', parseFloat(e.target.value) || 0)} />
//                   </div>
//                    <div className="space-y-1.5">
//                     <Label htmlFor="stone-weight">Stone Wt.</Label>
//                     <Input id="stone-weight" type="number" placeholder="0.00" value={currentForm.stoneWeight || ""} onChange={(e) => updateFormData(activeFormIndex, 'stoneWeight', parseFloat(e.target.value) || 0)} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label htmlFor="net-weight">Net Wt.</Label>
//                     <Input id="net-weight" type="number" placeholder="0.00" value={currentForm.netWeight || ""} onChange={(e) => updateFormData(activeFormIndex, 'netWeight', parseFloat(e.target.value) || 0)} />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                    <div className="space-y-1.5">
//                     <Label htmlFor="amount">Amount</Label>
//                     <Input id="amount" type="number" placeholder="0" value={currentForm.amount || ""} onChange={(e) => updateFormData(activeFormIndex, 'amount', parseFloat(e.target.value) || 0)} />
//                   </div>
//                    <div className="space-y-1.5">
//                     <Label htmlFor="proc-fee">Proc. Fee</Label>
//                     <Input id="proc-fee" type="number" placeholder="0" value={currentForm.processingFee || ""} onChange={(e) => updateFormData(activeFormIndex, 'processingFee', parseFloat(e.target.value) || 0)} />
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-between items-center">
//              <Button onClick={addNewForm} size="sm" variant="ghost" className="flex items-center gap-2 text-black">
//                 <PlusIcon className="w-4 h-4" />
//                 Add Another Loan
//              </Button>
//             <Button onClick={handleSave} disabled={loading} className="w-32 h-10 bg-black rounded-full text-white font-semibold hover:bg-gray-800 shadow-md">
//               {loading ? 'Saving...' : 'Save'}
//             </Button>
//           </div>

//           {/* === UI ENHANCEMENT: Redesigned recent entries list === */}
//           {repledgeEntries.length > 0 && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold px-1">Recent Entries</h3>
//               {repledgeEntries.map((entry) => (
//                 <Card key={entry.id} className="shadow-sm">
//                   <CardContent className="p-3 flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                        <div className="bg-black text-white rounded-lg w-12 h-12 flex items-center justify-center">
//                          <Banknote className="w-6 h-6"/>
//                        </div>
//                        <div className="space-y-0.5">
//                          <p className="font-bold text-sm">
//                             {entry.loan_no} <span className="text-gray-500 font-normal">&rarr;</span> {entry.re_no}
//                          </p>
//                          <p className="text-sm font-semibold text-gray-800">
//                            ₹ {entry.amount.toLocaleString('en-IN')}
//                          </p>
//                          <p className="text-xs text-gray-500">
//                            {getBankName(entry.bank_id)} &bull; {format(new Date(entry.created_at), 'dd MMM yyyy')}
//                          </p>
//                        </div>
//                     </div>

//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-red-50 hover:text-red-600 h-8 w-8">
//                           <TrashIcon className="w-4 h-4" />
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Delete Entry?</DialogTitle>
//                            <DialogDescription>
//                             This will permanently delete the re-pledge for <span className="font-medium text-black">{entry.re_no}</span>.
//                            </DialogDescription>
//                         </DialogHeader>
//                         <DialogFooter>
//                            <DialogClose asChild>
//                              <Button variant="outline">Cancel</Button>
//                            </DialogClose>
//                            <DialogClose asChild>
//                              <Button variant="destructive" onClick={() => handleDelete(entry.id)}>Delete</Button>
//                            </DialogClose>
//                         </DialogFooter>
//                       </DialogContent>
//                     </Dialog>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}

//           {totalPages > 1 && (
//             <Pagination className="pt-4">
//               <PaginationContent>
//                 <PaginationItem>
//                   <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
//                 </PaginationItem>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                   <PaginationItem key={page}>
//                     <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
//                       {page}
//                     </PaginationLink>
//                   </PaginationItem>
//                 ))}
//                 <PaginationItem>
//                   <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
//                 </PaginationItem>
//               </PaginationContent>
//             </Pagination>
//           )}

//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

import React, { useState, useEffect } from "react";
import { Building2Icon, SearchIcon, PlusIcon, TrashIcon, SettingsIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../.././../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import { useRepledge } from "../../../hooks/useRepledge";
import { useBanks } from "../../../hooks/useBank";
import { format, addMonths } from "date-fns";

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

  const { banks, loading: banksLoading } = useBanks();

  const [formTemplate, setFormTemplate] = useState<FormTemplateData>({
    bankId: "",
    interestPercent: 0,
    validityPeriod: 0,
    afterInterestPercent: 0,
    paymentMethod: "",
    startDate: "",
  });

  const [forms, setForms] = useState<RepledgeFormData[]>([{
    loanId: "",
    loanNo: "",
    reNo: "",
    netWeight: 0,
    grossWeight: 0,
    stoneWeight: 0,
    amount: 0,
    processingFee: 0,
    bankId: "",
    interestPercent: 0,
    validityPeriod: 0,
    afterInterestPercent: 0,
    paymentMethod: "",
    dueDate: "",
    startDate: "",
    endDate: "",
  }]);

  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false);
  const [showBankManagement, setShowBankManagement] = useState(false);

  const currentForm = forms[activeFormIndex];

  // ---------------------- HANDLERS ----------------------
  const handleBankSelectionChange = (bankId: string) => {
    // Find the full bank object from the list of banks
    const selectedBank = banks.find(b => b.id === bankId);

    // Use the functional form of setForms to ensure you have the latest state
    setForms(currentForms => {
      const newForms = [...currentForms];
      const formToUpdate = { ...newForms[activeFormIndex] };

      // Update all fields at once
      formToUpdate.bankId = bankId;
      if (selectedBank) {
        formToUpdate.interestPercent = selectedBank.default_interest || 0;
        formToUpdate.validityPeriod = selectedBank.validity_months || 0;
        formToUpdate.afterInterestPercent = selectedBank.post_validity_interest || 0;
        formToUpdate.paymentMethod = selectedBank.payment_method || "";
      } else {
        // If the bank is deselected, clear the related fields
        formToUpdate.interestPercent = 0;
        formToUpdate.validityPeriod = 0;
        formToUpdate.afterInterestPercent = 0;
        formToUpdate.paymentMethod = "";
      }

      // Place the updated form back into the array
      newForms[activeFormIndex] = formToUpdate;

      // Return the new array to update the state once
      return newForms;
    });
  };

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
  const handleLoanSearch = async (loanNo: string) => {
    if (!loanNo.trim()) return;

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
    }
  };

  const addNewForm = () => {
    const newForm: RepledgeFormData = {
      loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0, stoneWeight: 0,
      amount: 0, processingFee: 0, dueDate: "", endDate: "",
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
    return bank ? bank.name : "";
  };

  const handleSave = async () => {
    for (const form of forms) {
      if (form.loanNo && form.reNo) {
        await saveRepledgeEntry({
          loan_id: form.loanId || null, // ✅ keep UUID string
          loan_no: form.loanNo,
          re_no: form.reNo,
          net_weight: form.netWeight,
          gross_weight: form.grossWeight,
          stone_weight: form.stoneWeight,
          amount: form.amount,
          processing_fee: form.processingFee,
          bank_id: form.bankId || null, // ✅ keep UUID string
          interest_percent: form.interestPercent,
          validity_period: form.validityPeriod,
          after_interest_percent: form.afterInterestPercent,
          payment_method: form.paymentMethod || null, // ✅ correct column name
          start_date: form.startDate || null,
          end_date: form.endDate || null,
          due_date: form.dueDate || null,
        });
      }
    }

    setForms([{
      loanId: "",
      loanNo: "",
      reNo: "",
      netWeight: 0,
      grossWeight: 0,
      stoneWeight: 0,
      amount: 0,
      processingFee: 0,
      bankId: "",
      interestPercent: 0,
      validityPeriod: 0,
      afterInterestPercent: 0,
      paymentMethod: "",
      dueDate: "",
      startDate: "",
      endDate: "",
    }]);
    setActiveFormIndex(0);
  };


  const handleDelete = async (id: string) => {
    await deleteRepledgeEntry(id);
  };

  // ---------------------- RENDER ----------------------
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white">
        <header className="w-full h-[73px] bg-black rounded-b-[47px] flex items-center justify-center relative">
          <h1 className="text-white text-xl font-semibold">Re Pledge Entry</h1>
          <Button
            onClick={() => setShowBankManagement(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 p-2"
          >
            <SettingsIcon className="w-5 h-5 text-white" />
          </Button>
        </header>

        <div className="p-4 space-y-4">
          {/* Bank Selection */}
          <div className="relative">
            <Select
              value={currentForm.bankId}
              // This is the crucial change. We now call a single handler function.
              onValueChange={handleBankSelectionChange}
            >
              <SelectTrigger className="w-full h-12 bg-[#f7f6fc] border-[#e0e1e3] rounded-[30px] px-4">
                <div className="flex items-center gap-2">
                  <Building2Icon className="w-6 h-6" />
                  <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select bank"} />
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

          {/* Interest, Validity, After Interest */}
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Int %"
              value={currentForm.interestPercent || ""}
              onChange={(e) => updateFormData(activeFormIndex, "interestPercent", parseFloat(e.target.value) || 0)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
            <Input
              type="number"
              placeholder="Validity"
              value={currentForm.validityPeriod || ""}
              onChange={(e) => updateFormData(activeFormIndex, "validityPeriod", parseInt(e.target.value) || 0)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
            <Input
              type="number"
              placeholder="Aft.Int %"
              value={currentForm.afterInterestPercent || ""}
              onChange={(e) => updateFormData(activeFormIndex, "afterInterestPercent", parseFloat(e.target.value) || 0)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
          </div>

          {/* Payment / Dates */}
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="text"
              placeholder="Payment Method"
              value={currentForm.paymentMethod}
              onChange={(e) => updateFormData(activeFormIndex, "paymentMethod", e.target.value)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
            <Input
              type="date"
              value={currentForm.startDate}
              onChange={(e) =>
                updateFormData(activeFormIndex, "startDate", e.target.value)
              }
              className="h-10 bg-[#f7f6fc] border border-[#242424] rounded-[30px] text-center text-sm px-0.5 appearance-none relative"
            />

            <Input
              type="date"
              placeholder="End Date"
              value={currentForm.endDate}
              readOnly
              className="h-10 bg-[#f0f0f0] border-[#cccccc] rounded-[30px] text-center text-sm text-gray-500"
            />
          </div>

          <Card className="bg-black rounded-[20px] p-4 relative">
            <CardContent className="p-0 space-y-4">
              {forms.length > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {forms.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFormIndex(index)}
                        className={`w-8 h-8 rounded-full text-sm font-semibold ${activeFormIndex === index
                          ? 'bg-white text-black'
                          : 'bg-gray-600 text-white'
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  {forms.length > 1 && (
                    <Button
                      onClick={() => removeForm(activeFormIndex)}
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}

              <div className="relative">
                <div className="flex items-center bg-white rounded-[15px] p-2 transition-all focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-blue-500">
                  <Input
                    placeholder="Search by Ln.no"
                    aria-label="Search by Loan Number"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSuggestionSelected(false);
                    }}
                    className="border-0 bg-transparent text-sm flex-1 h-8 p-0 focus-outline-none"
                  />
                  <Button
                    onClick={() => handleLoanSearch(searchQuery)}
                    size="sm"
                    aria-label="Search"
                    className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 rounded-md"
                  >
                    <SearchIcon className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>

                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="p-3 text-sm text-gray-500 text-center">updating...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion.loan_no}
                          onClick={() => {
                            setIsSuggestionSelected(true);
                            setSearchQuery(suggestion.loan_no);
                            handleLoanSearch(suggestion.loan_no);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-black">{suggestion.loan_no}</div>
                              <div className="text-gray-500 text-xs capitalize">{suggestion.status}</div>
                            </div>
                            <div className="font-mono text-xs text-gray-600">₹{suggestion.amount}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">No results found.</div>
                    )}
                  </div>
                )}
              </div>

              <Input
                placeholder="Re.no"
                value={currentForm.reNo}
                onChange={(e) => updateFormData(activeFormIndex, 'reNo', e.target.value)}
                className="bg-white rounded-[30px] border-[#242424] text-sm"
              />

              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Weight"
                  value={currentForm.grossWeight || ""}
                  onChange={(e) => updateFormData(activeFormIndex, 'grossWeight', parseFloat(e.target.value) || 0)}
                  className="bg-white rounded-[30px] border-[#242424] text-sm"
                />
                <Input
                  type="number"
                  placeholder="St. Wt"
                  value={currentForm.stoneWeight || ""}
                  onChange={(e) => updateFormData(activeFormIndex, 'stoneWeight', parseFloat(e.target.value) || 0)}
                  className="bg-white rounded-[30px] border-[#242424] text-sm"
                />
                <Input
                  type="number"
                  placeholder="Nt.Wt"
                  value={currentForm.netWeight || ""}
                  onChange={(e) => updateFormData(activeFormIndex, 'netWeight', parseFloat(e.target.value) || 0)}
                  className="bg-white rounded-[30px] border-[#242424] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={currentForm.amount || ""}
                  onChange={(e) => updateFormData(activeFormIndex, 'amount', parseFloat(e.target.value) || 0)}
                  className="bg-white rounded-[30px] border-[#242424] text-sm col-span-1"
                />
                <Input
                  type="number"
                  placeholder="Proc Fee"
                  value={currentForm.processingFee || ""}
                  onChange={(e) => updateFormData(activeFormIndex, 'processingFee', parseFloat(e.target.value) || 0)}
                  className="bg-white rounded-[30px] border-[#242424] text-sm"
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button
              onClick={addNewForm}
              size="sm"
              variant="outline"
              className="h-10 rounded-full px-4 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Another
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-32 h-10 bg-black rounded-[31.5px] text-white font-semibold"
            >
              {loading ? 'Loading...' : 'Save'}
            </Button>
          </div>


          {repledgeEntries.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Recent Entries</h3>
              {repledgeEntries.map((entry) => (
                <Card key={entry.id} className="p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{entry.loan_no} - {entry.re_no}</p>
                      <p className="text-sm text-gray-600">
                        Bank: {getBankName(entry.bank_id)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: ₹{entry.amount} | Fee: ₹{entry.processing_fee}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(entry.created_at), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        {/* <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button> */}
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Entry</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this re-pledge entry? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(entry.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}


          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Dialog open={showBankManagement} onOpenChange={setShowBankManagement}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bank Management</DialogTitle>
                <DialogDescription>
                  Manage your banks here. You can add, edit, or remove banks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <QuickAddBankForm onBankAdded={() => { }} />

                <div className="space-y-2">
                  <h4 className="font-medium">Available Banks</h4>
                  {banksLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : banks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No banks found</div>
                  ) : (
                    banks.map((bank) => (
                      <div key={bank.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{bank.name}</div>
                          {bank.branch && <div className="text-xs text-gray-500">{bank.branch}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowBankManagement(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const QuickAddBankForm = ({ onBankAdded }: { onBankAdded: () => void }) => {
  const { createBank, loading } = useBanks();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    branch: '',
    defaultInterest: '',
    validityMonths: '',
    postValidityInterest: '',
    paymentMethod: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createBank(formData);
      setFormData({
        name: '',
        code: '',
        branch: '',
        defaultInterest: '',
        validityMonths: '',
        postValidityInterest: '',
        paymentMethod: '',
      });
      onBankAdded();
    } catch (error) {
      console.error('Error creating bank:', error);
    }
  };


  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3">Quick Add Bank</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Bank Name *"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="h-10"
          required
        />
        <Input
          placeholder="Bank Code (Optional)"
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          className="h-10"
        />
        <Input
          placeholder="Branch Name (Optional)"
          value={formData.branch}
          onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
          className="h-10"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Interest %"
            value={formData.defaultInterest}
            onChange={(e) => setFormData(prev => ({ ...prev, defaultInterest: e.target.value }))}
            className="h-10"
          />
          <Input
            type="number"
            placeholder="Validity (Months)"
            value={formData.validityMonths}
            onChange={(e) => setFormData(prev => ({ ...prev, validityMonths: e.target.value }))}
            className="h-10"
          />
        </div>
        <Input
          type="number"
          placeholder="Interest % after validity"
          value={formData.postValidityInterest}
          onChange={(e) => setFormData(prev => ({ ...prev, postValidityInterest: e.target.value }))}
          className="h-10"
        />
        <Input
          placeholder="Default Payment Method"
          value={formData.paymentMethod}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
          className="h-10"
        />
        <Button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="w-full h-10 bg-black text-white"
        >
          {loading ? 'Adding...' : 'Add Bank'}
        </Button>
      </form>

    </div>
  );
};