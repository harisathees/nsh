// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { Customer, Loan, Jewel } from '../lib/supabase';

// interface PledgeFormData {
//   customer: Partial<Customer>;
//   loan: Partial<Loan>;
//   jewels: Partial<Jewel>[];
// }

// interface PledgeContextType {
//   formData: PledgeFormData;
//   updateCustomer: (data: Partial<Customer>) => void;
//   updateLoan: (data: Partial<Loan>) => void;
//   updateJewels: (jewels: Partial<Jewel>[]) => void;
//   addJewel: (jewel: Partial<Jewel>) => void;
//   removeJewel: (index: number) => void;
//   resetForm: () => void;
//   selectedLoan: Loan | null;
//   setSelectedLoan: (loan: Loan | null) => void;
//   currentView: 'list' | 'form';
//   setCurrentView: (view: 'list' | 'form') => void;
// }

// const PledgeContext = createContext<PledgeContextType | undefined>(undefined);

// const initialFormData: PledgeFormData = {
//   customer: {},
//   loan: { status: 'Active', interest_taken: false, processing_fee: 0 },
//   jewels: [{}]
// };

// export const PledgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [formData, setFormData] = useState<PledgeFormData>(initialFormData);
//   const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
//   const [currentView, setCurrentView] = useState<'list' | 'form'>('list');

//   const updateCustomer = (data: Partial<Customer>) => {
//     setFormData(prev => ({
//       ...prev,
//       customer: { ...prev.customer, ...data }
//     }));
//   };

//   const updateLoan = (data: Partial<Loan>) => {
//     setFormData(prev => ({
//       ...prev,
//       loan: { ...prev.loan, ...data }
//     }));
//   };

//   const updateJewels = (jewels: Partial<Jewel>[]) => {
//     setFormData(prev => ({
//       ...prev,
//       jewels
//     }));
//   };

//   const addJewel = (jewel: Partial<Jewel>) => {
//     setFormData(prev => ({
//       ...prev,
//       jewels: [...prev.jewels, jewel]
//     }));
//   };

//   const removeJewel = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       jewels: prev.jewels.filter((_, i) => i !== index)
//     }));
//   };

//   const resetForm = () => {
//     setFormData(initialFormData);
//     setSelectedLoan(null);
//   };

//   return (
//     <PledgeContext.Provider value={{
//       formData,
//       updateCustomer,
//       updateLoan,
//       updateJewels,
//       addJewel,
//       removeJewel,
//       resetForm,
//       selectedLoan,
//       setSelectedLoan,
//       currentView,
//       setCurrentView
//     }}>
//       {children}
//     </PledgeContext.Provider>
//   );
// };

// export const usePledge = () => {
//   const context = useContext(PledgeContext);
//   if (context === undefined) {
//     throw new Error('usePledge must be used within a PledgeProvider');
//   }
//   return context;
// };