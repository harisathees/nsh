// Utility functions for loan status calculations

export const calculateLoanStatus = (
  loanDate: string | null,
  validityMonths: number | null,
  currentStatus: string | null
): 'Active' | 'Overdue' | 'Closed' => {
  // If already marked as closed, keep it closed
  if (currentStatus === 'Closed') {
    return 'Closed';
  }

  // If no date or validity, default to Active
  if (!loanDate || !validityMonths) {
    return 'Active';
  }

  const today = new Date();
  const loanStartDate = new Date(loanDate);
  
  // Calculate due date by adding validity months to loan date
  const dueDate = new Date(loanStartDate);
  dueDate.setMonth(dueDate.getMonth() + validityMonths);

  // Check if today is >= due date
  if (today >= dueDate) {
    return 'Overdue';
  }

  return 'Active';
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-IN');
};

export const formatCurrency = (amount: number | null): string => {
  if (!amount) return "₹0";
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Overdue':
      return 'bg-violet-100 text-violet-800';
    case 'Closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusAbbreviation = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'A';
    case 'Overdue':
      return 'O';
    case 'Closed':
      return 'C';
    default:
      return 'N';
  }
};