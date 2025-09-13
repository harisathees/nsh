import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepledgeData } from "../../../hooks/useRepledgeDataDetails";
import { useBanks } from "../../../hooks/useBank";
import * as XLSX from 'xlsx';
import { FiSearch, FiFilter, FiDownload, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { Button } from '../../../components/ui/button';
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";

// --- Themed Loading Spinner ---
const GoldCoinSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20" aria-label="Loading repledge data">
    <svg className="coin-spinner w-16 h-16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4" />
      <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
    </svg>
    <p className="mt-4 text-sm font-semibold text-amber-800">Loading Repledge History...</p>
  </div>
);

/* -------------------------
   Local PaginationNav
   - deterministic behavior
   - uses 1-based page numbers
   ------------------------- */
interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}
const PaginationNav: React.FC<PaginationNavProps> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const buildPages = (cur: number, total: number, maxButtons = 5) => {
    const pages: number[] = [];
    let start = Math.max(1, cur - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pages = buildPages(currentPage, totalPages, 5);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* <div className="text-xs text-slate-600">
        {totalItems !== undefined && itemsPerPage !== undefined
          ? `Showing page ${currentPage} of ${totalPages} — ${totalItems} records`
          : `Page ${currentPage} of ${totalPages}`}
      </div> */}

      <nav className="inline-flex items-center space-x-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
          aria-label="Previous page"
        >
          Prev
        </button>

        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-md text-sm hover:bg-slate-100">1</button>
            {pages[0] > 2 && <span className="px-2">…</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`px-3 py-1 rounded-md text-sm font-medium ${p === currentPage ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-2">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded-md text-sm hover:bg-slate-100">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export const RepledgeDetails = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bankFilter, setBankFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const { banks, loading: banksLoading } = useBanks();

  // NOTE: We pass currentPage (1-based) to the hook. If your hook expects an offset,
  // change the second argument to `(currentPage - 1) * itemsPerPage`.
  const { data, loading, error, totalCount } = useRepledgeData(
    searchTerm, currentPage, itemsPerPage, bankFilter, startDate, endDate
  );

  // compute totalPages safely (0 when no data)
  const totalPages = totalCount ? Math.ceil(Number(totalCount) / itemsPerPage) : 0;

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    if (showFilters) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // reset page when filters/search/date change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, bankFilter, startDate, endDate]);

  // clamp currentPage whenever totalCount/totalPages changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setBankFilter('all');
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  // Helper Functions
  const formatAmount = (amount: number | null) => amount ? `₹${amount.toLocaleString("en-IN")}` : "—";
  const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString("en-GB") : "No Date";

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const exportData = data.map(rp => ({
      'Repledge No': rp.re_no || 'N/A',
      'Original Loan No': rp.loan_no || 'N/A',
      'Customer Name': rp.customer_name || 'N/A',
      'Bank': rp.bank_name || 'N/A',
      'Repledge Date': formatDate(rp.created_at),
      'Amount': rp.amount || 0,
      'Status': rp.status || 'N/A',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Repledge Data');
    XLSX.writeFile(workbook, `repledge_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center p-10 bg-white rounded-lg shadow-md">
          <FiAlertCircle className="mx-auto text-5xl text-red-500 mb-4" />
          <p className="text-lg font-bold text-red-700">Failed to load data.</p>
          <p className="text-sm text-slate-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-100 min-h-screen font-sans">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <FaFileInvoiceDollar className="text-indigo-600" />
            <span>Repledge History</span>
          </h1>
          {!loading && (
            <span className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
              {totalCount ?? 0} Records
            </span>
          )}
        </div>
      </header>

      {/* --- Search + Filters --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-2 relative">
          <div className="relative flex-1">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <Input type="text" placeholder="Search customer, loan no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-100 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition" />
          </div>
          <div ref={filterRef} className="relative">
            <Button variant="outline" size="icon" onClick={() => setShowFilters(v => !v)} title="Filter" className="bg-slate-100 hover:bg-slate-200">
              <FiFilter className="h-4 w-4 text-slate-600" />
            </Button>
            <div className={`absolute right-0 top-full mt-2 z-10 w-72 origin-top-right transition-all duration-300 ease-in-out ${showFilters ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
              <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">Filter & Export</h3>
                  <button onClick={handleClearFilters} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"><FiXCircle size={14} /> Clear All</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Bank</label>
                    <Select value={bankFilter} onValueChange={setBankFilter} disabled={banksLoading}>
                      <SelectTrigger className="w-full bg-slate-100 border-transparent text-sm focus:ring-2 focus:ring-indigo-500"><SelectValue placeholder="Filter by Bank..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Banks</SelectItem>
                        {banks.map(bank => <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date Range</label>
                    <div className="gap-2">
                      <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-100 border-transparent text-sm focus:ring-2 focus:ring-indigo-500" />
                      <span className="text-slate-500 text-xs">to</span>
                      <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-100 border-transparent text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <Button onClick={exportToExcel} className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700"><FiDownload size={16} className="mr-2" /> Export Data</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Table / Card --- */}
      <div className="space-y-3">
        {loading ? <GoldCoinSpinner />
        : !data || data.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow-sm">
            <FiAlertCircle className="mx-auto text-4xl text-amber-500 mb-2" />
            <p className="font-semibold text-slate-700">No Repledges Found</p>
            <p className="text-sm text-slate-500">No records match your filters.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="hidden sm:table-header-group bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider col-span-2">Customer / Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan / Repledge No</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr key={item.id} onClick={() => navigate(`/view-repledge/${item.loan_id}`)} className="hover:bg-slate-50/50 cursor-pointer">
                      {/* --- DESKTOP VIEW --- */}
                      <td className="hidden sm:table-cell px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={item.customer_photo || undefined} className="object-cover" /><AvatarFallback>{item.customer_name?.charAt(0)}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 break-words">{item.customer_name || 'N/A'}</p>
                            <p className="text-xs text-slate-500 mt-1">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-600 align-top">{item.bank_name || '—'}</td>
                      <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs align-top">
                        <p>Loan no: <span className="text-slate-700">{item.loan_no || '—'}</span></p>
                        <p>Repledge no: <span className="text-slate-700 font-semibold">{item.re_no || '—'}</span></p>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-800 font-semibold align-top text-right">{formatAmount(item.amount)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm align-top">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm
                          ${item.status?.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                          : item.status?.toLowerCase() === 'closed'
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                        : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'}`}
                        >
                        {item.status || '—'}
                        </span>
                      </td>

                      {/* --- MOBILE CARD VIEW --- */}
                      <td className="sm:hidden p-3" colSpan={5}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={item.customer_photo || undefined} className="object-cover" /><AvatarFallback>{item.customer_name?.charAt(0)}</AvatarFallback></Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 truncate">{item.customer_name || 'N/A'}</p>
                              <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                          <p className="text-base font-bold text-slate-800 flex-shrink-0 pl-2">{formatAmount(item.amount)}</p>
                        </div>
                        <div className="border-t border-slate-100 mt-3 pt-3 grid grid-cols-4 gap-x-4 gap-y-2 text-xs">
                          <div><p className="text-slate-500">Bank</p><p className="font-medium text-slate-700 truncate">{item.bank_name || '—'}</p></div>
                          <div><p className="text-slate-500">Re.No</p><p className="font-mono font-semibold text-slate-700">{item.re_no || '—'}</p></div>
                          <div><p className="text-slate-500">Loan No</p><p className="font-mono text-slate-700">{item.loan_no || '—'}</p></div>
                          <div>
                            <p className="text-slate-500">Status</p>
                          <span
                             className={`inline-block px-1.5 py-0.2 rounded-full text-xs font-semibold shadow-sm
                              ${item.status?.toLowerCase() === 'active'
                              ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                              : item.status?.toLowerCase() === 'closed'
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                              : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'}`}
                            >
                              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : '—'}
                          </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------- Pagination ---------- */}
            <div className="mt-auto bg-transparent py-4">
              <PaginationNav
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                totalItems={Number(totalCount ?? 0)}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
