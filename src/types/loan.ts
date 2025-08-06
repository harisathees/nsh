export interface LoanData {
  id: string;
  amount: number;
  date: string; // from_date
  validity_months: number;
  interest_rate: number;
  interest_taken: boolean;
  processing_fee?: number;
  estimated_amount?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CalculationResult {
  totalMonths: string;
  finalInterestRate: string;
  totalInterest: number;
  interestReduction: number;
  additionalReduction: number;
  totalAmount: number;
}

export type CalculationMethod = 'method1' | 'method2' | 'method3' | 'method4';

export interface CalculationRecord {
  id: string;
  loan_id: string;
  end_date: string;
  additional_reduction_amount: number;
  calculation_method: CalculationMethod;
  total_months: string;
  final_interest_rate: string;
  total_interest: number;
  interest_reduction: number;
  total_amount: number;
  created_at: string;
}