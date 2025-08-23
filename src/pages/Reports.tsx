import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import NoticePrint from '../notice/noticeform/NoticePrint'; // Adjust path if needed

type ReportType = 'annualdue' | 'overdue' | null;

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [noticeLoan, setNoticeLoan] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!reportType) return;
    setLoading(true);
    supabase
      .from('customers')
      .select(`
        id, name, address, mobile_no, photo_url,
        loans (
          id, loan_no, date, duedate, amount, status
        )
      `)
      .then(({ data, error }) => {
        if (error) {
          setCustomers([]);
        } else {
          setCustomers(data || []);
        }
        setLoading(false);
      });
  }, [reportType]);

  // Filter and flatten loans for the selected report type
  const filteredLoans = React.useMemo(() => {
    if (!reportType) return [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    let result: any[] = [];
    customers.forEach((cust) => {
      (cust.loans || []).forEach((loan: any) => {
        if (loan.status !== 'Active') return;
        if (
          (reportType === 'overdue' && loan.duedate && new Date(loan.duedate) < today) ||
          (reportType === 'annualdue' && loan.date && new Date(loan.date) < oneYearAgo)
        ) {
          result.push({
            ...loan,
            customer: { 
              id: cust.id,
              name: cust.name, 
              address: cust.address, 
              mobile_no: cust.mobile_no,
              photo_url: cust.photo_url
            }
          });
        }
      });
    });
    // Sort by loan date descending
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customers, reportType]);

  if (!reportType) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen font-sans">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileText className="text-indigo-600" /> Reports
          </h1>
          <p className="text-slate-500 mt-1">View and print annual due and overdue loan reports.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-green-500/40 cursor-pointer"
            onClick={() => setReportType('annualdue')}
          >
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Annualdue Loans Report</h3>
              <p className="text-slate-500 text-sm">Track loans active for more than a year</p>
            </div>
          </div>
          <div
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-red-500/40 cursor-pointer"
            onClick={() => setReportType('overdue')}
          >
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Overdue Loans Report</h3>
              <p className="text-slate-500 text-sm">List of all overdue loans</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 bg-slate-50 min-h-screen font-sans">
      <button
        onClick={() => setReportType(null)}
        className="text-blue-600 hover:underline mb-4"
      >
        &larr; Back to Reports
      </button>
      <h2 className="text-xl font-bold mb-4">
        {reportType === 'annualdue'
          ? 'Loans Active for More Than a Year'
          : 'Overdue Loans'}
      </h2>
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : filteredLoans.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg text-gray-500 shadow-sm">
          No loans found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-2">
                {loan.customer.photo_url ? (
                  <img
                    src={loan.customer.photo_url}
                    alt={loan.customer.name || 'Customer'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    No Photo
                  </div>
                )}
              </div>
              <div className="font-semibold text-gray-900">{loan.customer.name || 'N/A'}</div>
              <div className="text-xs text-gray-600">{loan.customer.mobile_no || ''}</div>
              <div className="text-xs text-gray-500 text-center mb-2">{loan.customer.address || ''}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                  {loan.loan_no}
                </span>
                <span className="text-xs text-gray-700">₹{Number(loan.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    setNoticeLoan({
                      name: loan.customer?.name || '',
                      address: loan.customer?.address || '',
                      phone: loan.customer?.mobile_no || '',
                      date: new Date().toLocaleDateString('en-IN'),
                      jewelName: 'N/A',
                      count: 1,
                      itemNo: loan.loan_no || '',
                      itemDate: loan.date ? new Date(loan.date).toLocaleDateString('en-IN') : '',
                      amount: Number(loan.amount).toLocaleString('en-IN') || '',
                      loanId: loan.id,
                    })
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                >
                  Print annual Notice
                </button>
                <button
                  onClick={() => navigate(`/view-pledge/${loan.id}`)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {noticeLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-2 sm:p-4 rounded shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
              onClick={() => setNoticeLoan(null)}
              title="Close"
            >
              ×
            </button>
            <NoticePrint {...noticeLoan} />
          </div>
        </div>
      )}
    </div>
  );
}