import { differenceInDays } from 'date-fns';

export interface CalculationInputs {
  startDate: string;
  endDate: string;
  amount: number;
  interestRate: number;
  calculationMethod: 'method_1' | 'method_2' | 'method_3';
}

export interface CalculationResults {
  duration: number;
  finalInterestRate: number;
  calculatedInterest: number;
  totalPayable: number;
}

export const calculateRepledgeClose = (inputs: CalculationInputs): CalculationResults => {
  const { startDate, endDate, amount, interestRate, calculationMethod } = inputs;
  
  // Calculate duration in days
  let duration = differenceInDays(new Date(endDate), new Date(startDate));
  if (duration <= 7) {
    duration = 7; // Minimum duration of 7 days
  }
  
  let finalInterestRate = interestRate;
  let calculatedInterest = 0;
  
  switch (calculationMethod) {
    case 'method_1':
      // Simple interest calculation: (Principal × Rate × Time) / 100
      // Time is in days, so we divide by 365 to get yearly rate
      finalInterestRate = interestRate;
      calculatedInterest = (amount * interestRate * duration) / (360 * 100);
      break;
      
    case 'method_2':
      // Method 2: Coming soon - will be implemented in future
      finalInterestRate = interestRate;
      calculatedInterest = 0;
      break;
      
    case 'method_3':
      // Method 3: Coming soon - will be implemented in future
      finalInterestRate = interestRate;
      calculatedInterest = 0;
      break;
      
    default:
      finalInterestRate = interestRate;
      calculatedInterest = 0;
  }
  
  const totalPayable = amount + calculatedInterest;
  
  return {
    duration,
    finalInterestRate,
    calculatedInterest: Math.round(calculatedInterest * 100) / 100, // Round to 2 decimal places
    totalPayable: Math.round(totalPayable * 100) / 100
  };
};