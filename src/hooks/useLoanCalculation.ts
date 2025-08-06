import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoanData, CalculationResult, CalculationMethod, CalculationRecord } from '../types/loan';

export const useLoanCalculation = (loanId: string | null) => {
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loanId) {
      fetchLoanData(loanId);
    }
  }, [loanId]);

  const fetchLoanData = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Loan not found');
        return;
      }

      setLoanData(data);
    } catch (err) {
      setError('Failed to fetch loan data');
    } finally {
      setLoading(false);
    }
  };

  const calculateInterest = (
    method: CalculationMethod,
    toDate: string,
    reductionAmount: number = 0
  ): CalculationResult => {
    if (!loanData) {
      return {
        totalMonths: '0',
        finalInterestRate: '0%',
        totalInterest: 0,
        interestReduction: 0,
        additionalReduction: 0,
        totalAmount: 0,
      };
    }

    const fromDate = new Date(loanData.date);
    const endDate = new Date(toDate);
    const totalDays = Math.ceil((endDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    let totm = 0; // total months for calculation
    let totalMonthsDisplay = '';

    // Calculate duration based on method
    switch (method) {
      case 'method1':
        totm = calculateMethod1Duration(fromDate, endDate, totalDays);
        totalMonthsDisplay = totm === 0.5 ? '0.5 Months' : `${totm} Months`;
        break;
      case 'method2':
        totm = calculateMethod2Duration(totalDays);
        totalMonthsDisplay = `${totm} Months`;
        break;
      case 'method3':
        totm = calculateMethod3Duration(totalDays);
        totalMonthsDisplay = totm === 0 ? '0 Months' : `${totm} Months`;
        break;
      case 'method4':
        totm = calculateMethod4Duration(fromDate, endDate);
        totalMonthsDisplay = `${totm} Months`;
        break;
    }

    // Calculate interest rates
    const baseRate = loanData.interest_rate;
    const validityMonths = loanData.validity_months;
    
    let totalInterest = 0;
    let finalInterestRateDisplay = '';

    if (totm <= validityMonths) {
      totalInterest = (loanData.amount * baseRate * totm) / 100;
      finalInterestRateDisplay = `${baseRate}% per month`;
    } else {
      const surchargeRate = baseRate + 0.5;
      const baseInterest = (loanData.amount * baseRate * validityMonths) / 100;
      const surchargeInterest = (loanData.amount * surchargeRate * (totm - validityMonths)) / 100;
      totalInterest = baseInterest + surchargeInterest;
      finalInterestRateDisplay = `${baseRate}% for first ${validityMonths} months, then ${surchargeRate}%`;
    }

    // Calculate reductions
    const interestReduction = loanData.interest_taken 
      ? (loanData.amount * baseRate) / 100 
      : 0;

    const totalAmount = loanData.amount + totalInterest - interestReduction - reductionAmount;

    return {
      totalMonths: totalMonthsDisplay,
      finalInterestRate: finalInterestRateDisplay,
      totalInterest,
      interestReduction,
      additionalReduction: reductionAmount,
      totalAmount,
    };
  };

  const saveCalculationAndCloseLoan = async (
    endDate: string,
    additionalReductionAmount: number,
    calculationMethod: CalculationMethod,
    calculationResult: CalculationResult
  ): Promise<boolean> => {
    if (!loanData) return false;

    setSaving(true);
    setError(null);

    try {
      // Save calculation record
      const calculationData: Omit<CalculationRecord, 'id' | 'created_at'> = {
        loan_id: loanData.id,
        end_date: endDate,
        additional_reduction_amount: additionalReductionAmount,
        calculation_method: calculationMethod,
        total_months: calculationResult.totalMonths,
        final_interest_rate: calculationResult.finalInterestRate,
        total_interest: calculationResult.totalInterest,
        interest_reduction: calculationResult.interestReduction,
        total_amount: calculationResult.totalAmount,
      };

      const { error: calcError } = await supabase
        .from('calculations')
        .insert(calculationData);

      if (calcError) {
        setError('Failed to save calculation');
        return false;
      }

      // Update loan status to 'Closed'
      const { error: loanError } = await supabase
        .from('loans')
        .update({ status: 'Closed' })
        .eq('id', loanData.id);

      if (loanError) {
        setError('Failed to update loan status');
        return false;
      }

      // Update local loan data
      setLoanData(prev => prev ? { ...prev, status: 'Closed' } : null);
      
      return true;
    } catch (err) {
      setError('Failed to close loan');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loanData,
    loading,
    error,
    saving,
    calculateInterest,
    saveCalculationAndCloseLoan,
  };
};

// Method 1: Original 15-day rule
function calculateMethod1Duration(fromDate: Date, toDate: Date, totalDays: number): number {
  if (totalDays <= 15) {
    return 0.5;
  }
  
  const yearDiff = toDate.getFullYear() - fromDate.getFullYear();
  const monthDiff = toDate.getMonth() - fromDate.getMonth();
  let totm = yearDiff * 12 + monthDiff;
  
  if (toDate.getDate() > fromDate.getDate()) {
    totm += 1;
  }
  
  return totm;
}

// Method 2: Enhanced duration rules
function calculateMethod2Duration(totalDays: number): number {
  if (totalDays <= 7) {
    return 0.5;
  } else if (totalDays <= 15) {
    return 0.75;
  } else {
    return Math.ceil(totalDays / 30);
  }
}

// Method 3: Simplified duration rules
function calculateMethod3Duration(totalDays: number): number {
  if (totalDays <= 7) {
    return 0;
  } else {
    return Math.ceil(totalDays / 30);
  }
}

// Method 4: Strict month rounding
function calculateMethod4Duration(fromDate: Date, toDate: Date): number {
  const yearDiff = toDate.getFullYear() - fromDate.getFullYear();
  const monthDiff = toDate.getMonth() - fromDate.getMonth();
  let totm = yearDiff * 12 + monthDiff;
  
  // If there are any remaining days, add a full month
  if (toDate.getDate() >= fromDate.getDate()) {
    totm += 1;
  } else {
    // Handle cases where the day is earlier in the month
    totm += 1;
  }
  
  return Math.max(1, totm); // Minimum 1 month
}