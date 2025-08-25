import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useReactToPrint } from 'react-to-print';
import { FiSearch, FiPrinter, FiFileText, FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import OverdueNotice from '../OverdueNotice'; // Ensure this is the correct path

// --- Interfaces & Types ---
interface Jewel {
  description: string;
  pieces: number;
}
interface Loan {
  id: string; loan_no: string; date: string; duedate: string; amount: number; status: string; jewels: Jewel[]; validity_months: number; [key: string]: any;
}
interface Customer {
  id: string; name: string | null; mobile_no: string | null; address: string | null; photo_url: string | null; loans: Loan[];
}
const ITEMS_PER_PAGE = 9;

// --- Main Reports Component ---
export function Reports() {
  const [reportType, setReportType] = useState<'overdue' | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [noticeData, setNoticeData] = useState<any | null>(null);
  const singlePrintRef = useRef<HTMLDivElement>(null);
  const bulkPrintRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // --- 1. MODIFIED --- Supabase query now fetches 'validity_months' ---
  const fetchOverdueLoans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id, name, address, mobile_no, photo_url,
        loans!inner(
          id, loan_no, date, duedate, amount, status, validity_months,
          jewels ( description, pieces )
        )
      `)
      .eq('loans.status', 'Active')
      .lt('loans.duedate', new Date().toISOString());

    if (error) {
      console.error("Error fetching overdue loans:", error);
      setCustomers([]);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  const handleSelectReport = (type: 'overdue') => {
    setReportType(type);
    if (type === 'overdue') {
      fetchOverdueLoans();
    }
  };

  const filteredLoans = useMemo(() => {
    const allOverdueLoans = customers.flatMap(c => (c.loans || []).map(l => ({ ...l, customer: c })));
    const filtered = allOverdueLoans.filter(loan => {
      const s = search.toLowerCase();
      const searchMatch = s === '' ||
        loan.customer.name?.toLowerCase().includes(s) ||
        loan.customer.mobile_no?.includes(s) ||
        loan.loan_no?.toLowerCase().includes(s);

      let dateMatch = true;
      if (startDate && endDate) {
        const loanDueDate = new Date(loan.duedate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        loanDueDate.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        dateMatch = loanDueDate >= start && loanDueDate <= end;
      }
      return searchMatch && dateMatch;
    });
    
    return filtered.sort((a, b) => new Date(a.duedate).getTime() - new Date(b.duedate).getTime());
  }, [customers, search, startDate, endDate]);

  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLoans.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLoans, currentPage]);
  
  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [filteredLoans.length]);

  const handlePrintSingle = useReactToPrint({ content: () => singlePrintRef.current });
  const handlePrintAll = useReactToPrint({
    content: () => bulkPrintRef.current,
    documentTitle: `Overdue_Notices_${new Date().toLocaleDateString('en-IN')}`,
  });

  // --- 2. MODIFIED --- Now passes 'validity_months' to the notice data ---
  const openNoticePreview = (loan: any) => {
    let jewelName = 'N/A';
    let count = 0;

    if (loan.jewels && loan.jewels.length > 0) {
        jewelName = loan.jewels.map((j: Jewel) => j.description).join(', ');
        count = loan.jewels.reduce((total: number, j: Jewel) => total + (j.pieces || 0), 0);
    }

    setNoticeData({
      name: loan.customer.name || '',
      address: loan.customer.address || '',
      phone: loan.customer.mobile_no || '',
      date: new Date().toLocaleDateString('en-GB'),
      jewelName: jewelName,
      count: count,
      itemNo: loan.loan_no || '',
      itemDate: new Date(loan.date).toLocaleDateString('en-GB'),
      amount: loan.amount.toLocaleString('en-IN'),
      validity_months: loan.validity_months || 6, // Pass the dynamic value
    });
  };
  
  // --- RENDER LOGIC (No changes needed below this line) ---
  if (!reportType) {
    return (
      <div className="p-4 sm:p-6 bg-slate-100 min-h-screen font-sans">
        <header className="mb-6 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <FiFileText className="text-indigo-600" />
              <span>Reports</span>
            </h1>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-indigo-500/50 cursor-pointer"
                onClick={() => handleSelectReport('overdue')}>
                <div className="flex-shrink-0 bg-red-100 rounded-full p-4">
                    <FiAlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Overdue Loans Report</h3>
                    <p className="text-slate-500 text-sm">View, print, and manage all overdue loans.</p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-100 min-h-screen font-sans">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className="flex items-center gap-3">
                <button onClick={() => setReportType(null)} className="p-2 rounded-full hover:bg-slate-200 transition">
                    <FaArrowLeft className="text-slate-600"/>
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Overdue Loans</h1>
            </div>
            {!loading && (
                <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                    {filteredLoans.length} Loans Found
                </span>
            )}
        </div>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search name, phone, or loan no..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div className="mt-4 flex justify-end">
            <button onClick={handlePrintAll} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                <FiPrinter size={16} /> Print All Notices
            </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? ( <div className="text-center py-20"><FiLoader className="mx-auto animate-spin text-4xl text-indigo-500" /></div> ) 
        : filteredLoans.length === 0 ? ( <div className="text-center bg-white p-10 rounded-lg shadow-sm"><FiAlertCircle className="mx-auto text-4xl text-amber-500 mb-2" /> No overdue loans found.</div> ) 
        : (
          <>
            {paginatedLoans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/view-pledge/${loan.id}`)}>
                    <img src={loan.customer.photo_url || `https://ui-avatars.com/api/?name=${loan.customer.name || 'NN'}&background=random`} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{loan.customer.name || 'N/A'}</p>
                      <p className="text-sm text-slate-500">{loan.customer.mobile_no || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 sm:mt-0 sm:justify-end sm:gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Loan No.</p>
                      <p className="font-medium font-mono text-slate-700 text-sm">{loan.loan_no || '—'}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-red-500 font-semibold">Due Date</p>
                      <p className="font-semibold text-red-600 text-sm">{new Date(loan.duedate).toLocaleDateString('en-GB')}</p>
                    </div>
                    <button onClick={() => openNoticePreview(loan)} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition">
                        Print Notice
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className="py-4 flex items-center justify-between">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg shadow-sm text-sm font-semibold text-slate-600 disabled:opacity-50 transition"><FiChevronLeft size={16} /> Previous</button>
                <span className="text-sm font-semibold text-slate-500">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg shadow-sm text-sm font-semibold text-slate-600 disabled:opacity-50 transition">Next <FiChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </div>

      {noticeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative">
            <h3 className="text-lg font-bold mb-4">Print Preview</h3>
            <div className="max-h-[60vh] overflow-y-auto border rounded-lg"><OverdueNotice ref={singlePrintRef} {...noticeData} /></div>
            <div className="flex items-center justify-end gap-4 mt-6">
                <button onClick={() => setNoticeData(null)} className="text-sm font-semibold text-slate-600">Cancel</button>
                <button onClick={handlePrintSingle} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2"><FiPrinter size={16} /> Print</button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <div ref={bulkPrintRef}>
            {filteredLoans.map(loan => {
                let jewelName = 'N/A';
                let count = 0;
                if (loan.jewels && loan.jewels.length > 0) {
                    jewelName = loan.jewels.map((j: Jewel) => j.description).join(', ');
                    count = loan.jewels.reduce((total: number, j: Jewel) => total + (j.pieces || 0), 0);
                }
                return (
                    <div key={loan.id} className="page-break">
                        <OverdueNotice
                            name={loan.customer.name || ''} address={loan.customer.address || ''} phone={loan.customer.mobile_no || ''}
                            date={new Date().toLocaleDateString('en-GB')} jewelName={jewelName} count={count}
                            itemNo={loan.loan_no || ''} itemDate={new Date(loan.date).toLocaleDateString('en-GB')}
                            amount={loan.amount.toLocaleString('en-IN')}
                            validity_months={loan.validity_months || 6}
                        />
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
}
