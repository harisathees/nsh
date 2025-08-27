// import React, { useState, useEffect } from "react";
// import { Building2Icon, ChevronDownIcon, SearchIcon, PlusIcon, TrashIcon, SettingsIcon } from "lucide-react";
// import { Button } from "../../components/ui/button";
// import { Card, CardContent } from "../../components/ui/card";
// import { Input } from "../../components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
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

// interface RepledgeFormData {
//   loanId: string;
//   loanNo: string;
//   reNo: string;
//   netWeight: number;
//   grossWeight: number;
//   stoneWeight: number;
//   amount: number;
//   processingFee: number;
//   bankId: string; // Changed from bankName to bankId
//   interestPercent: number;
//   validityPeriod: number;
//   afterInterestPercent: number;
//   paymentDate: string;
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
//   bankName: string;
//   interestPercent: number;
//   validityPeriod: number;
//   afterInterestPercent: number;
//   paymentDate: string;
//   startDate: string; // --- ADD THIS LINE ---

// }
// export const RePledge = (): JSX.Element => {
  
//   const {
//     loading,
//     error,
//     repledgeEntries,
//     currentPage,
//     totalPages,
//     fetchLoanDetails,
//     fetchRepledgeEntries,
//     saveRepledgeEntry,
//     deleteRepledgeEntry,
//     searchLoanSuggestions,
//     setCurrentPage,
//   } = useRepledge();

//   const [formTemplate, setFormTemplate] = useState<FormTemplateData>({
//     bankName: "",
//     interestPercent: 0,
//     validityPeriod: 0,
//     afterInterestPercent: 0,
//     paymentDate: "",
//     startDate: "", // --- ADD THIS LINE ---

//   });



// const { banks, loading: banksLoading } = useBanks();

//  const [forms, setForms] = useState<RepledgeFormData[]>([{
//     loanId: "",
//     loanNo: "",
//     reNo: "",
//     netWeight: 0,
//     grossWeight: 0,
//     stoneWeight: 0,
//     amount: 0,
//     processingFee: 0,
//     bankId: "",
//     interestPercent: 0,
//     validityPeriod: 0,
//     afterInterestPercent: 0,
//     paymentDate: "",
//     dueDate: "",
//     startDate: "", // --- ADDED ---
//     endDate: "",   // --- ADDED ---
//   }]);

//   const [activeFormIndex, setActiveFormIndex] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [isSuggestionSelected, setIsSuggestionSelected] = useState(false);
//   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
//   const [showBankManagement, setShowBankManagement] = useState(false);


// useEffect(() => {
//   // Sync the search input with the data of the currently active form.
//   const currentLoanNo = forms[activeFormIndex]?.loanNo || "";
//   setSearchQuery(currentLoanNo);

//   // Hide any old suggestions when switching forms.
//   setShowSuggestions(false);
// }, [activeFormIndex, forms]);

// useEffect(() => {
//   const activeForm = forms[activeFormIndex];
//   if (activeForm) {
//     setFormTemplate({
//       bankName: activeForm.bankId,
//       interestPercent: activeForm.interestPercent,
//       validityPeriod: activeForm.validityPeriod,
//       afterInterestPercent: activeForm.afterInterestPercent,
//       paymentDate: activeForm.paymentDate,
//       startDate: activeForm.startDate,
//     });
//   }
// }, [forms, activeFormIndex]);


//  const currentForm = forms[activeFormIndex];

//   // Handle loan search
//   const handleLoanSearch = async (loanNo: string) => {
//     if (!loanNo.trim()) return;

//     const result = await fetchLoanDetails(loanNo);
//     if (result) {
//       const updatedForms = [...forms];
//       updatedForms[activeFormIndex] = {
//         ...updatedForms[activeFormIndex],
//         loanId: result.loan.id,
//         loanNo: result.loan.loan_no,
//         reNo: `RE${Date.now()}`, // Generate unique re-pledge number
//         // reNo: `RE${Date.now()}`,
//         netWeight: result.totals.net_weight,
//         grossWeight: result.totals.gross_weight,
//         stoneWeight: result.totals.stone_weight,
//         amount: result.loan.amount,
//         processingFee: result.loan.processing_fee,
//       };
//       setForms(updatedForms);
//     }
//   };

//   // Handle search suggestions
  
//   // --- MODIFY THIS USEEFFECT ---
// useEffect(() => {
//   // If a suggestion was just clicked, do nothing.
//   if (isSuggestionSelected) {
//     return;
//   }
//   const debounceTimer = setTimeout(async () => {
//     if (searchQuery.length >= 2) {
//       const results = await searchLoanSuggestions(searchQuery);
//       setSuggestions(results);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   }, 300);
//   return () => clearTimeout(debounceTimer);
// }, [searchQuery, isSuggestionSelected, searchLoanSuggestions]); // Add dependencies

//   // --- ADDED --- useEffect to automatically calculate the end date
//   useEffect(() => {
//     if (currentForm && currentForm.startDate && currentForm.validityPeriod > 0) {
//       try {
//         const start = new Date(currentForm.startDate);
//         const end = addMonths(start, currentForm.validityPeriod);
//         const formattedEndDate = format(end, 'yyyy-MM-dd');

//         // Only update if the calculated date is different
//         if (formattedEndDate !== currentForm.endDate) {
//           updateFormData(activeFormIndex, 'endDate', formattedEndDate);
//         }
//       } catch (e) {
//         console.error("Invalid date for calculation", e);
//       }
//     }
//   }, [currentForm?.startDate, currentForm?.validityPeriod, activeFormIndex]);


//   // Add new form
//  const addNewForm = () => {
//   const newForm: RepledgeFormData = {
//     // Unique fields that should always be blank
//     loanId: "", loanNo: "", reNo: "", netWeight: 0, grossWeight: 0, stoneWeight: 0,
//     amount: 0, processingFee: 0, dueDate: "", endDate: "",
//     // Use the template for all shared fields (now includes startDate)
//     ...formTemplate,
//   };
//   setForms([...forms, newForm]);
//   setActiveFormIndex(forms.length);
//   setSearchQuery("");
// };


//   // Remove form
//   const removeForm = (index: number) => {
//     if (forms.length > 1) {
//       const updatedForms = forms.filter((_, i) => i !== index);
//       setForms(updatedForms);
//       if (activeFormIndex >= updatedForms.length) {
//         setActiveFormIndex(updatedForms.length - 1);
//       }
//     }
//   };

//   // Update form data
//   const updateFormData = (index: number, field: keyof RepledgeFormData, value: any) => {
//     const updatedForms = [...forms];
//     updatedForms[index] = { ...updatedForms[index], [field]: value };
//     setForms(updatedForms);
//   };

//   // Get bank name by ID
//   const getBankName = (bankId: string) => {
//     const bank = banks.find(b => b.id === bankId);
//     return bank ? bank.name : '';
//   };

//   // Save all forms
//   const handleSave = async () => {
//     for (const form of forms) {
//       if (form.loanNo && form.reNo) {
//         await saveRepledgeEntry({
//           loan_id: form.loanId,
//           loan_no: form.loanNo,
//           re_no: form.reNo,
//           net_weight: form.netWeight,
//           gross_weight: form.grossWeight,
//           stone_weight: form.stoneWeight,
//           amount: form.amount,
//           processing_fee: form.processingFee,
//           bank_id: form.bankId, // Changed to use bank_id
//           interest_percent: form.interestPercent,
//           validity_period: form.validityPeriod,
//           after_interest_percent: form.afterInterestPercent,
//           payment_date: form.paymentDate,
//           due_date: form.dueDate,
//         });
//       }
//     }
    
//     // Reset forms after saving
//     setForms([{
//       loanId: "",
//       loanNo: "",
//       reNo: "",
//       netWeight: 0,
//       grossWeight: 0,
//       stoneWeight: 0,
//       amount: 0,
//       processingFee: 0,
//       bankId: "", // Changed from bankName
//       interestPercent: 0,
//       validityPeriod: 0,
//       afterInterestPercent: 0,
//       paymentDate: "",
//       dueDate: "",
//     }]);
//     setActiveFormIndex(0);
//   };

//   // Handle delete confirmation
//   const handleDelete = async (id: string) => {
//     await deleteRepledgeEntry(id);
//     setDeleteConfirmId(null);
//   };

//   const currentForm = forms[activeFormIndex];

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-md mx-auto bg-white">
//         {/* Header */}
//         <header className="w-full h-[73px] bg-black rounded-b-[47px] flex items-center justify-center relative">
//           <h1 className="text-white text-xl font-semibold">
//             Re Pledge Entry
//           </h1>
//           <Button
//             onClick={() => setShowBankManagement(true)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 p-2"
//           >
//             <SettingsIcon className="w-5 h-5 text-white" />
//           </Button>
//         </header>

//         <div className="p-4 space-y-4">
//           {/* Subtitle */}
//           <div className="mt-4">
//             <p className="text-gray-800 text-base">Single/Multiple Repledge</p>
//           </div>

//           {/* Bank Selection */}
//           <div className="relative">
//             <Select
//               value={currentForm.bankId}
//               onValueChange={(value) => updateFormData(activeFormIndex, 'bankId', value)}
//             >
//               <SelectTrigger className="w-full h-12 bg-[#f7f6fc] border-[#e0e1e3] rounded-[30px] px-4">
//                 <div className="flex items-center gap-2">
//                   <Building2Icon className="w-6 h-6" />
//                   <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select bank"} />
//                 </div>
//               </SelectTrigger>
//               <SelectContent>
//                 {banks.map((bank) => (
//                   <SelectItem key={bank.id} value={bank.id}>
//                     <div className="flex flex-col">
//                       <span>{bank.name}</span>
//                       {bank.branch && (
//                         <span className="text-xs text-gray-500">{bank.branch}</span>
//                       )}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* First Row of Controls */}
//           <div className="grid grid-cols-3 gap-2">
//             <Input
//               type="number"
//               placeholder="Int %"
//               value={currentForm.interestPercent || ""}
//               onChange={(e) => updateFormData(activeFormIndex, 'interestPercent', parseFloat(e.target.value) || 0)}
//               className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
//             />
//             <Input
//               type="number"
//               placeholder="Validity"
//               value={currentForm.validityPeriod || ""}
//               onChange={(e) => updateFormData(activeFormIndex, 'validityPeriod', parseInt(e.target.value) || 0)}
//               className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
//             />
//             <Input
//               type="number"
//               placeholder="Aft.Int %"
//               value={currentForm.afterInterestPercent || ""}
//               onChange={(e) => updateFormData(activeFormIndex, 'afterInterestPercent', parseFloat(e.target.value) || 0)}
//               className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
//             />
//           </div>

//           {/* Second Row of Controls */}
//           <div className="grid grid-cols-3 gap-2">
//             <Input
//               type="text"
//               placeholder="Payment Details"
//               value={currentForm.paymentDate}
//               onChange={(e) => updateFormData(activeFormIndex, 'paymentDate', e.target.value)}
//               className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
//             />
//             <Input
//               type="text"
//               placeholder="Payment Details"
//               value={currentForm.paymentDate}
//               onChange={(e) => updateFormData(activeFormIndex, 'paymentDate', e.target.value)}
//               className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
//             />
//             <Input
//               type="date"
//               placeholder="Due Date"
//               value={currentForm.dueDate}
//               onChange={(e) => updateFormData(activeFormIndex, 'dueDate', e.target.value)}
//               className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
//             />
//           </div>

//           {/* Black Card Section */}
//           <Card className="bg-black rounded-[20px] p-4 relative">
//             <CardContent className="p-0 space-y-4">
//               {/* Form Navigation */}
//               {forms.length > 1 && (
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex gap-2">
//                     {forms.map((_, index) => (
//                       <button
//                         key={index}
//                         onClick={() => setActiveFormIndex(index)}
//                         className={`w-8 h-8 rounded-full text-sm font-semibold ${
//                           activeFormIndex === index
//                             ? 'bg-white text-black'
//                             : 'bg-gray-600 text-white'
//                         }`}
//                       >
//                         {index + 1}
//                       </button>
//                     ))}
//                   </div>
//                   {forms.length > 1 && (
//                     <Button
//                       onClick={() => removeForm(activeFormIndex)}
//                       size="sm"
//                       variant="destructive"
//                       className="h-8 w-8 p-0"
//                     >
//                       <TrashIcon className="w-4 h-4" />
//                     </Button>
//                   )}
//                 </div>
//               )}

//               {/* Loan Search */}
//               <div className="relative">
//                 <div className="flex items-center bg-white rounded-[15px] border-2 border-white p-2">
//                   <Input
//                     placeholder="Ln.no"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="border-0 bg-transparent text-sm flex-1"
//                   />
//                   <Button
//                     onClick={() => handleLoanSearch(searchQuery)}
//                     size="sm"
//                     className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100"
//                   >
//                     <SearchIcon className="w-4 h-4 text-gray-600" />
//                   </Button>
//                 </div>
                
//                 {/* Search Suggestions */}
//                 {showSuggestions && suggestions.length > 0 && (
//                   <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
//                     {suggestions.map((suggestion) => (
//                       <button
//                         key={suggestion.loan_no}
//                         onClick={() => {
//                           setSearchQuery(suggestion.loan_no);
//                           handleLoanSearch(suggestion.loan_no);
//                           setShowSuggestions(false);
//                         }}
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
//                       >
//                         <div className="font-medium">{suggestion.loan_no}</div>
//                         <div className="text-gray-500 text-xs">
//                           ₹{suggestion.amount} - {suggestion.status}
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Re.no */}
//               <Input
//                 placeholder="Re.no"
//                 value={currentForm.reNo}
//                 onChange={(e) => updateFormData(activeFormIndex, 'reNo', e.target.value)}
//                 className="bg-white rounded-[30px] border-[#242424] text-sm"
//               />

//               {/* Weight Fields */}
//               <div className="grid grid-cols-3 gap-2">
//                 <Input
//                   type="number"
//                   placeholder="Nt.Wt"
//                   value={currentForm.netWeight || ""}
//                   onChange={(e) => updateFormData(activeFormIndex, 'netWeight', parseFloat(e.target.value) || 0)}
//                   className="bg-white rounded-[30px] border-[#242424] text-sm"
//                 />
//                 <Input
//                   type="number"
//                   placeholder="Weight"
//                   value={currentForm.grossWeight || ""}
//                   onChange={(e) => updateFormData(activeFormIndex, 'grossWeight', parseFloat(e.target.value) || 0)}
//                   className="bg-white rounded-[30px] border-[#242424] text-sm"
//                 />
//                 <Input
//                   type="number"
//                   placeholder="St. Wt"
//                   value={currentForm.stoneWeight || ""}
//                   onChange={(e) => updateFormData(activeFormIndex, 'stoneWeight', parseFloat(e.target.value) || 0)}
//                   className="bg-white rounded-[30px] border-[#242424] text-sm"
//                 />
//               </div>

//               {/* Amount and Processing Fee */}
//               <div className="grid grid-cols-2 gap-2">
//                 <Input
//                   type="number"
//                   placeholder="Amount"
//                   value={currentForm.amount || ""}
//                   onChange={(e) => updateFormData(activeFormIndex, 'amount', parseFloat(e.target.value) || 0)}
//                   className="bg-white rounded-[30px] border-[#242424] text-sm col-span-1"
//                 />
//                 <Input
//                   type="number"
//                   placeholder="Proc Fee"
//                   value={currentForm.processingFee || ""}
//                   onChange={(e) => updateFormData(activeFormIndex, 'processingFee', parseFloat(e.target.value) || 0)}
//                   className="bg-white rounded-[30px] border-[#242424] text-sm"
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Existing Entries List */}
//           {repledgeEntries.length > 0 && (
//             <div className="space-y-2">
//               <h3 className="text-lg font-semibold">Recent Entries</h3>
//               {repledgeEntries.map((entry) => (
//                 <Card key={entry.id} className="p-3 bg-gray-50">
//                   <div className="flex justify-between items-start">
//                     <div className="space-y-1">
//                       <p className="font-medium">{entry.loan_no} - {entry.re_no}</p>
//                       <p className="text-sm text-gray-600">
//                         Bank: {getBankName(entry.bank_id)}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         Amount: ₹{entry.amount} | Fee: ₹{entry.processing_fee}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {format(new Date(entry.created_at), 'dd/MM/yyyy')}
//                       </p>
//                     </div>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           className="h-8 w-8 p-0"
//                         >
//                           <TrashIcon className="w-4 h-4" />
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Delete Entry</DialogTitle>
//                           <DialogDescription>
//                             Are you sure you want to delete this re-pledge entry? This action cannot be undone.
//                           </DialogDescription>
//                         </DialogHeader>
//                         <DialogFooter>
//                           <Button variant="outline">Cancel</Button>
//                           <Button
//                             variant="destructive"
//                             onClick={() => handleDelete(entry.id)}
//                           >
//                             Delete
//                           </Button>
//                         </DialogFooter>
//                       </DialogContent>
//                     </Dialog>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <Pagination className="mt-6">
//               <PaginationContent>
//                 <PaginationItem>
//                   <PaginationPrevious
//                     onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                     className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
//                   />
//                 </PaginationItem>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                   <PaginationItem key={page}>
//                     <PaginationLink
//                       onClick={() => setCurrentPage(page)}
//                       isActive={currentPage === page}
//                     >
//                       {page}
//                     </PaginationLink>
//                   </PaginationItem>
//                 ))}
//                 <PaginationItem>
//                   <PaginationNext
//                     onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                     className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
//                   />
//                 </PaginationItem>
//               </PaginationContent>
//             </Pagination>
//           )}

//           {/* Add Button */}
//           <div className="flex justify-center">
//             <Button
//               onClick={addNewForm}
//               className="w-12 h-12 bg-black rounded-full p-0"
//             >
//               <PlusIcon className="w-6 h-6 text-white" />
//             </Button>
//           </div>

//           {/* Save Button */}
//           <div className="flex justify-center">
//             <Button
//               onClick={handleSave}
//               disabled={loading}
//               className="w-32 h-10 bg-black rounded-[31.5px] text-white font-semibold"
//             >
//               {loading ? 'Saving...' : 'Save'}
//             </Button>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               {error}
//             </div>
//           )}

//           {/* Bank Management Modal */}
//           <Dialog open={showBankManagement} onOpenChange={setShowBankManagement}>
//             <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Bank Management</DialogTitle>
//                 <DialogDescription>
//                   Manage your banks here. You can add, edit, or remove banks.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {/* Quick Add Bank Form */}
//                 <QuickAddBankForm onBankAdded={() => {}} />
                
//                 {/* Banks List */}
//                 <div className="space-y-2">
//                   <h4 className="font-medium">Available Banks</h4>
//                   {banksLoading ? (
//                     <div className="text-center py-4 text-gray-500">Loading...</div>
//                   ) : banks.length === 0 ? (
//                     <div className="text-center py-4 text-gray-500">No banks found</div>
//                   ) : (
//                     banks.map((bank) => (
//                       <div key={bank.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                         <div>
//                           <div className="font-medium">{bank.name}</div>
//                           {bank.branch && <div className="text-xs text-gray-500">{bank.branch}</div>}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button onClick={() => setShowBankManagement(false)}>
//                   Close
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Quick Add Bank Form Component
// const QuickAddBankForm = ({ onBankAdded }: { onBankAdded: () => void }) => {
//   const { createBank, loading } = useBanks();
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     branch: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.name.trim()) return;

//     try {
//       await createBank(formData);
//       setFormData({ name: '', code: '', branch: '' });
//       onBankAdded();
//     } catch (error) {
//       console.error('Error creating bank:', error);
//     }
//   };

//   return (
//     <div className="border rounded-lg p-4">
//       <h4 className="font-medium mb-3">Quick Add Bank</h4>
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <Input
//           placeholder="Bank Name *"
//           value={formData.name}
//           onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//           className="h-10"
//           required
//         />
//         <div className="grid grid-cols-2 gap-2">
//           <Input
//             placeholder="Code"
//             value={formData.code}
//             onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
//             className="h-10"
//           />
//           <Input
//             placeholder="Branch"
//             value={formData.branch}
//             onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
//             className="h-10"
//           />
//         </div>
//         <Button
//           type="submit"
//           disabled={loading || !formData.name.trim()}
//           className="w-full h-10 bg-black text-white"
//         >
//           {loading ? 'Adding...' : 'Add Bank'}
//         </Button>
//       </form>
//     </div>
//   );
// };



import React, { useState, useEffect } from "react";
import { Building2Icon, ChevronDownIcon, SearchIcon, PlusIcon, TrashIcon, SettingsIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { useRepledge } from "../../hooks/useRepledge";
import { useBanks } from "../../hooks/useBank";
import { format, addMonths } from "date-fns";

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
  paymentDate: string;
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
  paymentDate: string;
  startDate: string;
}

export const RePledge = (): JSX.Element => {
  
  const {
    loading,
    error,
    repledgeEntries,
    currentPage,
    totalPages,
    fetchLoanDetails,
    fetchRepledgeEntries,
    saveRepledgeEntry,
    deleteRepledgeEntry,
    searchLoanSuggestions,
    setCurrentPage,
  } = useRepledge();

  const [formTemplate, setFormTemplate] = useState<FormTemplateData>({
    bankId: "",
    interestPercent: 0,
    validityPeriod: 0,
    afterInterestPercent: 0,
    paymentDate: "",
    startDate: "", 
  });

  const { banks, loading: banksLoading } = useBanks();

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
    paymentDate: "",
    dueDate: "",
    startDate: "", 
    endDate: "",
  }]);

  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LoanSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBankManagement, setShowBankManagement] = useState(false);

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
        paymentDate: activeForm.paymentDate,
        startDate: activeForm.startDate,
      });
    }
  }, [forms, activeFormIndex]);

  const currentForm = forms[activeFormIndex];

  const handleLoanSearch = async (loanNo: string) => {
    if (!loanNo.trim()) return;

    const result = await fetchLoanDetails(loanNo);
    if (result) {
      const updatedForms = [...forms];
      updatedForms[activeFormIndex] = {
        ...updatedForms[activeFormIndex],
        loanId: result.loan.id,
        loanNo: result.loan.loan_no,
        reNo: `RE${Date.now()}`,
        netWeight: result.totals.net_weight,
        grossWeight: result.totals.gross_weight,
        stoneWeight: result.totals.stone_weight,
        amount: result.loan.amount,
        processingFee: result.loan.processing_fee,
      };
      setForms(updatedForms);
    }
  };

  useEffect(() => {
    if (isSuggestionSelected) {
      return;
    }
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
        const formattedEndDate = format(end, 'yyyy-MM-dd');

        if (formattedEndDate !== currentForm.endDate) {
          updateFormData(activeFormIndex, 'endDate', formattedEndDate);
        }
      } catch (e) {
        console.error("Invalid date for calculation", e);
      }
    }
  }, [currentForm?.startDate, currentForm?.validityPeriod, activeFormIndex]);

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
    return bank ? bank.name : '';
  };

  const handleSave = async () => {
    for (const form of forms) {
      if (form.loanNo && form.reNo) {
        await saveRepledgeEntry({
          loan_id: form.loanId,
          loan_no: form.loanNo,
          re_no: form.reNo,
          net_weight: form.netWeight,
          gross_weight: form.grossWeight,
          stone_weight: form.stoneWeight,
          amount: form.amount,
          processing_fee: form.processingFee,
          bank_id: form.bankId,
          interest_percent: form.interestPercent,
          validity_period: form.validityPeriod,
          after_interest_percent: form.afterInterestPercent,
          payment_date: form.paymentDate || null,
          due_date: form.dueDate || null,
          start_date: form.startDate || null,
          end_date: form.endDate || null,
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
      paymentDate: "",
      dueDate: "",
      startDate: "",
      endDate: "",
    }]);
    setActiveFormIndex(0);
  };

  const handleDelete = async (id: string) => {
    await deleteRepledgeEntry(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white">
        <header className="w-full h-[73px] bg-black rounded-b-[47px] flex items-center justify-center relative">
          <h1 className="text-white text-xl font-semibold">
            Re Pledge Entry
          </h1>
          <Button
            onClick={() => setShowBankManagement(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/10 p-2"
          >
            <SettingsIcon className="w-5 h-5 text-white" />
          </Button>
        </header>

        <div className="p-4 space-y-4">
          <div className="mt-4">
            <p className="text-gray-800 text-base">Single/Multiple Repledge</p>
          </div>

          <div className="relative">
            <Select
              value={currentForm.bankId}
              onValueChange={(value) => updateFormData(activeFormIndex, 'bankId', value)}
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
                      {bank.branch && (
                        <span className="text-xs text-gray-500">{bank.branch}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Int %"
              value={currentForm.interestPercent || ""}
              onChange={(e) => updateFormData(activeFormIndex, 'interestPercent', parseFloat(e.target.value) || 0)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
            <Input
              type="number"
              placeholder="Validity"
              value={currentForm.validityPeriod || ""}
              onChange={(e) => updateFormData(activeFormIndex, 'validityPeriod', parseInt(e.target.value) || 0)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
            <Input
              type="number"
              placeholder="Aft.Int %"
              value={currentForm.afterInterestPercent || ""}
              onChange={(e) => updateFormData(activeFormIndex, 'afterInterestPercent', parseFloat(e.target.value) || 0)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              type="text"
              placeholder="Payment Method"
              value={currentForm.paymentDate}
              onChange={(e) => updateFormData(activeFormIndex, 'paymentDate', e.target.value)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={currentForm.startDate}
              onChange={(e) => updateFormData(activeFormIndex, 'startDate', e.target.value)}
              className="h-10 bg-[#f7f6fc] border-[#242424] rounded-[30px] text-center text-sm"
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
                        className={`w-8 h-8 rounded-full text-sm font-semibold ${
                          activeFormIndex === index
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
                      <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
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
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
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

          <div className="flex justify-center">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-32 h-10 bg-black rounded-[31.5px] text-white font-semibold"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>

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
                <QuickAddBankForm onBankAdded={() => {}} />
                
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createBank(formData);
      setFormData({ name: '', code: '', branch: '' });
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
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="h-10"
          />
          <Input
            placeholder="Branch"
            value={formData.branch}
            onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
            className="h-10"
          />
        </div>
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