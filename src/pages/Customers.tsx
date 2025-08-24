import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { calculateLoanStatus, getStatusColor, getStatusAbbreviation } from '../lib/loanUtils';
import * as XLSX from 'xlsx';
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';

// --- Interfaces & Types ---
interface Loan {
  id: string;
  loan_no: string;
  date: string;
  amount: number;
  validity_months: number;
  status: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string | null;
  mobile_no: string | null;
  address: string | null;
  photo_url: string | null;
  created_at: string | null;
  loans: Loan[];
  mostRecentLoan: Loan | null;
  loan_status: string;
}

const ITEMS_PER_PAGE = 10;

// --- Themed Loading Component ---
const GoldCoinSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20" aria-label="Loading customers">
    <svg className="coin-spinner w-16 h-16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4"/>
      <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
    </svg>
    <p className="mt-4 text-sm font-semibold text-amber-800">Loading Customers...</p>
  </div>
);

// --- Main Customers Component ---
export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [validityFilter, setValidityFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);
  
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`*, loans (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customersWithLoans = data?.map((customer) => {
        const sortedLoans = (customer.loans || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const mostRecentLoan = sortedLoans[0] || null;
        const loan_status = mostRecentLoan ? calculateLoanStatus(mostRecentLoan.date, mostRecentLoan.validity_months, mostRecentLoan.status) : 'No Loan';
        return { ...customer, loans: sortedLoans, mostRecentLoan, loan_status };
      }) || [];
      setCustomers(customersWithLoans);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCustomers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return customers
      .filter(customer => {
        const s = search.toLowerCase();
        return s === '' ||
          customer.name?.toLowerCase().includes(s) ||
          customer.mobile_no?.includes(s) ||
          (customer.loans || []).some(loan => loan.loan_no?.toLowerCase().includes(s));
      })
      .filter(customer => statusFilter === 'All' || customer.loan_status === statusFilter)
      .filter(customer => validityFilter === 'All' || customer.mostRecentLoan?.validity_months === Number(validityFilter))
      .filter(customer => {
        if (!customer.mostRecentLoan?.date) {
            // If a date filter is active, hide customers with no loans. If not, show them.
            return dateFilter === 'All' && !startDate && !endDate;
        }
        
        const loanDate = new Date(customer.mostRecentLoan.date);
        loanDate.setHours(0, 0, 0, 0);

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return loanDate >= start && loanDate <= end;
        }

        switch (dateFilter) {
          case 'All': return true;
          case 'Today': return loanDate.getTime() === today.getTime();
          case 'This Week': return loanDate >= startOfWeek;
          case 'This Month': return loanDate >= startOfMonth;
          case 'This Year': return loanDate >= startOfYear;
          default: return true;
        }
      });
  }, [customers, search, statusFilter, validityFilter, dateFilter, startDate, endDate]);

  const totalLoanCount = useMemo(() => {
      return filteredCustomers.reduce((acc, customer) => acc + (customer.loans?.length || 0), 0);
  }, [filteredCustomers]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
      setCurrentPage(1);
  }, [filteredCustomers.length]);
  
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setValidityFilter('All');
    setDateFilter('All');
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
  };

  const exportToExcel = () => {
    const exportData: any[] = [];
    filteredCustomers.forEach(cust => {
        if (cust.loans.length > 0) {
            cust.loans.forEach(loan => {
                exportData.push({
                    'Customer Name': cust.name || 'N/A',
                    'Mobile No': cust.mobile_no || 'N/A',
                    'Address': cust.address || 'N/A',
                    'Loan No': loan.loan_no || 'N/A',
                    'Loan Amount': loan.amount || 0,
                    'Loan Date': loan.date ? new Date(loan.date).toLocaleDateString('en-IN') : 'N/A',
                    'Validity (Months)': loan.validity_months || 'N/A',
                    'Loan Status': calculateLoanStatus(loan.date, loan.validity_months, loan.status),
                });
            });
        } else {
             exportData.push({ 'Customer Name': cust.name || 'N/A', 'Mobile No': cust.mobile_no || 'N/A', 'Address': cust.address || 'N/A', 'Loan No': 'No Loans' });
        }
    });

    if (exportData.length === 0) {
        alert("No data to export!");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Loan Data');
    XLSX.writeFile(workbook, `full_loan_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-100 min-h-screen font-sans">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <FaUsers className="text-indigo-600" />
              <span>Customers</span>
            </h1>
            {!loading && (
                <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                   {totalLoanCount} Loans
                </span>
            )}
        </div>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-2 relative">
            <div className="relative flex-1">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search by name, phone, or loan no..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition" />
            </div>
            <div ref={filterRef} className="relative">
                <button className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg p-2.5 transition" onClick={() => setShowFilters(v => !v)} title="Filter">
                    <FiFilter className="text-slate-600" />
                </button>
                <div className={`absolute right-0 top-full mt-2 z-10 w-72 origin-top-right transition-all duration-300 ease-in-out ${showFilters ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
                    <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-800">Filter & Export</h3>
                            <button onClick={handleClearFilters} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                <FiXCircle size={14}/> Clear All
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Custom Date Range</label>
                                <div className="gap-1">
                                    <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDateFilter('All'); }} className="w-full bg-slate-100 border-transparent rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                                    <span className="text-slate-500 text-xs">to</span>
                                    <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setDateFilter('All'); }} className="w-full bg-slate-100 border-transparent rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="border-t border-slate-200"></div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Predefined Range</label>
                                <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setStartDate(''); setEndDate(''); }} className="w-full bg-slate-100 border-transparent rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                    <option value="All">All Time</option><option value="Today">Today</option><option value="This Week">This Week</option><option value="This Month">This Month</option><option value="This Year">This Year</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                    <option value="All">All Statuses</option><option value="Active">Active</option><option value="Overdue">Overdue</option><option value="Closed">Closed</option><option value="No Loan">No Loan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Validity</label>
                                <select value={validityFilter} onChange={e => setValidityFilter(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                                    <option value="All">All Validity</option><option value="3">3 Months</option><option value="6">6 Months</option>
                                </select>
                            </div>
                            <button onClick={exportToExcel} className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition">
                                <FiDownload size={16} /> Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? ( <GoldCoinSpinner /> ) 
        : filteredCustomers.length === 0 ? ( <div className="text-center bg-white p-10 rounded-lg shadow-sm"><FiAlertCircle className="mx-auto text-4xl text-amber-500 mb-2" /> No customers match your filters.</div> ) 
        : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="hidden sm:table-header-group bg-slate-50">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="w-1/5 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan No.</th>
                        <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="w-[80px] px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginatedCustomers.map((customer) => (
                        <React.Fragment key={customer.id}>
                            <tr className="sm:hidden hover:bg-slate-50/50 cursor-pointer" onClick={() => customer.mostRecentLoan && navigate(`/view-pledge/${customer.mostRecentLoan.id}`)}>
                                <td colSpan={4} className="p-4">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img src={customer.photo_url || `https://ui-avatars.com/api/?name=${customer.name || 'NN'}&background=random`} alt={customer.name || ''} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 break-words">{customer.name || 'N/A'}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {customer.mostRecentLoan?.date ? new Date(customer.mostRecentLoan.date).toLocaleDateString('en-GB') : 'No Loan Data'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full flex-shrink-0 ml-2 ${getStatusColor(customer.loan_status)}`}>
                                            {getStatusAbbreviation(customer.loan_status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-500">Loan No.</p>
                                            <p className="text-sm font-mono text-slate-700">{customer.mostRecentLoan?.loan_no || '—'}</p>
                                        </div>
                                        <div className='text-right'>
                                            <p className="text-xs text-slate-500">Amount</p>
                                            <p className="text-sm font-semibold text-slate-800">₹{customer.mostRecentLoan?.amount?.toLocaleString('en-IN') || '—'}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hidden sm:table-row hover:bg-slate-50/50 cursor-pointer" onClick={() => customer.mostRecentLoan && navigate(`/view-pledge/${customer.mostRecentLoan.id}`)}>
                            <td className="px-4 py-3 align-top">
                                <div className="flex items-start gap-3">
                                <img src={customer.photo_url || `https://ui-avatars.com/api/?name=${customer.name || 'NN'}&background=random`} alt={customer.name || ''} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 break-words">{customer.name || 'N/A'}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {customer.mostRecentLoan?.date ? new Date(customer.mostRecentLoan.date).toLocaleDateString('en-GB') : 'No Loan Data'}
                                    </p>
                                </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 font-mono align-top">{customer.mostRecentLoan?.loan_no || '—'}</td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-semibold align-top">₹{customer.mostRecentLoan?.amount?.toLocaleString('en-IN') || '—'}</td>
                            <td className="px-4 py-3 text-center align-top">
                                <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${getStatusColor(customer.loan_status)}`}>
                                {getStatusAbbreviation(customer.loan_status)}
                                </span>
                            </td>
                            </tr>
                        </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-between">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg shadow-sm text-sm font-semibold text-slate-600 disabled:opacity-50 transition">
                  <FiChevronLeft size={16} /> Previous
                </button>
                <span className="text-sm font-semibold text-slate-500">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-lg shadow-sm text-sm font-semibold text-slate-600 disabled:opacity-50 transition">
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};