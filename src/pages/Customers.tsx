import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { calculateLoanStatus, getStatusAbbreviation, getStatusColor } from '../lib/loanUtils';
import * as XLSX from 'xlsx';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';

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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Date Added');
  const [statusFilter, setStatusFilter] = useState('All');
  const [validityFilter, setValidityFilter] = useState('All');
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
    };
    if (showSort) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSort]);

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
        const sortedLoans = customer.loans?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const mostRecentLoan = sortedLoans?.[0];

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

  const handleDeleteCustomer = async (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();

    const isConfirmed = window.confirm('Are you sure you want to delete this customer? This will permanently remove their record.');

    if (isConfirmed) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', customerId);

        if (error) throw error;

        alert('Customer deleted successfully!');
        setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== customerId));
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete the customer. Please try again.');
      }
    }
  };

  // Unified search, filter, and sort
  const filteredCustomers = customers
    .filter((customer) => {
      const s = search.toLowerCase();
      const matches =
        customer.name?.toLowerCase().includes(s) ||
        customer.mobile_no?.includes(s) ||
        customer.address?.toLowerCase().includes(s) ||
        customer.loan_no?.toLowerCase().includes(s);
      const statusMatch = statusFilter === 'All' ? true : customer.loan_status === statusFilter;
      const validityMatch = validityFilter === 'All' ? true : customer.validity_months === Number(validityFilter);
      return matches && statusMatch && validityMatch;
    })
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
            <span className="text-blue-600">
              <FaUsers size={28} />
            </span>
            Customers
          </h1>
          {/* <p className="text-gray-600 mt-1">Manage your customers and their loans</p> */}
        </div>
      </div>

      {/* Unified Search & Single Sort Icon */}
      <div className="flex items-center gap-2 mb-4 relative">
        <div className="relative flex-1">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, address, or loan no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition"
          />
        </div>
        <button
          className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full p-2 border border-gray-300"
          onClick={() => setShowSort((v) => !v)}
          title="Sort & Filter"
        >
          <FiFilter size={20} />
        </button>
        {showSort && (
          <div
            ref={sortRef}
            className="absolute right-0 top-12 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64"
          >
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="Date Added">Date Added</option>
                <option value="Loan Date">Loan Date</option>
                <option value="Name">Name</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Overdue">Overdue</option>
                <option value="Closed">Closed</option>
                <option value="No Loan">No Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Validity</label>
              <select
                value={validityFilter}
                onChange={e => setValidityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="All">All Validity</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
            <button
              onClick={exportToExcel}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
            >
              Export
            </button>
          </div>
        )}
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
                <th className="w-1/4 px-4 py-3 text-left text-sm font-semibold text-gray-900">Ln.No</th>
                <th className="w-1/6 px-4 py-3 text-center text-sm font-semibold text-gray-900">Profile</th>
                <th className="w-1/3 px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="w-1/4 px-4 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  className="hover:bg-blue-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {customer.loan_id ? (
                      <span className="truncate" title={customer.loan_no || ''}>
                        {customer.loan_no}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleDeleteCustomer(e, customer.id)}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        title="Delete Customer"
                      >
                        Delete
                      </button>
                    )}
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