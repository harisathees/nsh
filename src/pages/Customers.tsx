import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { calculateLoanStatus, getStatusAbbreviation, getStatusColor } from '../lib/loanUtils';
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  name: string | null;
  mobile_no: string | null;
  whatsapp_no: string | null;
  address: string | null;
  id_proof: string | null;
  photo_url: string | null;
  audio_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  loan_no: string | null;
  loan_id: string | null;
  loan_date: string | null;
  validity_months: number | null;
  loan_status: string | null;
}

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loanNoSearch, setLoanNoSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [validityFilter, setValidityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date Added');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          loans!fk_loans_customer_id (
            id,
            loan_no,
            date,
            validity_months,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customersWithLoans = data?.map((customer) => {
        const mostRecentLoan = customer.loans?.[0];
        const calculatedStatus = mostRecentLoan
          ? calculateLoanStatus(
              mostRecentLoan.date,
              mostRecentLoan.validity_months,
              mostRecentLoan.status
            )
          : 'No Loan';

        return {
          ...customer,
          loan_no: mostRecentLoan?.loan_no || null,
          loan_id: mostRecentLoan?.id || null,
          loan_date: mostRecentLoan?.date || null,
          validity_months: mostRecentLoan?.validity_months || null,
          loan_status: calculatedStatus
        };
      }) || [];

      setCustomers(customersWithLoans);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    if (customer.loan_id) {
      navigate(`/view-pledge/${customer.loan_id}`);
    } else {
      alert('This customer has no active loans');
    }
  };

  const filteredCustomers = customers
    .filter((customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile_no?.includes(searchTerm) ||
      customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((customer) =>
      loanNoSearch === '' ? true : customer.loan_no?.toLowerCase().includes(loanNoSearch.toLowerCase())
    )
    .filter((customer) =>
      statusFilter === 'All' ? true : customer.loan_status === statusFilter
    )
    .filter((customer) =>
      validityFilter === 'All' ? true : customer.validity_months === Number(validityFilter)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'Name':
          return (a.name || '').localeCompare(b.name || '');
        case 'Loan Date':
          return new Date(b.loan_date || '').getTime() - new Date(a.loan_date || '').getTime();
        case 'Date Added':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

  const exportToExcel = () => {
    const exportData = filteredCustomers.map((cust) => ({
      'Loan No': cust.loan_no || 'N/A',
      'Name': cust.name || 'N/A',
      'Mobile No': cust.mobile_no || 'N/A',
      'Address': cust.address || 'N/A',
      'Status': cust.loan_status || 'No Loan',
      'Validity (Months)': cust.validity_months || 'N/A',
      'Loan Date': cust.loan_date ? new Date(cust.loan_date).toLocaleDateString('en-IN') : 'N/A',
      'Created At': cust.created_at ? new Date(cust.created_at).toLocaleDateString('en-IN') : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, `customers_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">👥</span>
            Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage your customers and their loans</p>
        </div>
        
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search name / phone / address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Search by Loan No"
          value={loanNoSearch}
          onChange={(e) => setLoanNoSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Overdue">Overdue</option>
          <option value="Closed">Closed</option>
          {/* <option value="No Loan">No Loan</option> */}
        </select>

        {/* <select
          value={validityFilter}
          onChange={(e) => setValidityFilter(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All Validities</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} month{(i + 1 > 1 ? 's' : '')}
            </option>
          ))}
        </select> */}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="Date Added">Sort by Date Added</option>
          <option value="Loan Date">Sort by Loan Date</option>
          <option value="Name">Sort by Name</option>
        </select>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-3 rounded-lg text-sm"
        >
           Export to Excel
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg text-gray-500 shadow-sm">
          No customers match your filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-1/4 px-4 py-3 text-left text-sm font-semibold text-gray-900">Loan No</th>
                <th className="w-1/6 px-4 py-3 text-center text-sm font-semibold text-gray-900">Profile</th>
                <th className="w-2/5 px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="w-1/5 px-4 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  className="hover:bg-blue-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 truncate" title={customer.loan_no || 'N/A'}>
                    {customer.loan_no || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 mx-auto">
                      {customer.photo_url ? (
                        <img
                          src={customer.photo_url}
                          alt={customer.name || 'Customer'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-500">
                          No Photo
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 truncate" title={customer.name || 'N/A'}>
                    {customer.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        customer.loan_status || 'No Loan'
                      )}`}
                    >
                      <span className="hidden sm:inline">{customer.loan_status || 'No Loan'}</span>
                      <span className="sm:hidden">{getStatusAbbreviation(customer.loan_status || 'No Loan')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
