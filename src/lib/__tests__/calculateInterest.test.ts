import { describe, it, expect } from 'vitest';
import { calculateInterest } from '../calculateInterest';

describe('calculateInterest', () => {
  const baseInput = {
    method: 'method1' as const,
    fromDate: '2025-06-01',
    toDate: '2025-08-05',
    amount: 10000,
    interestRate: 2,
    validityMonths: 2,
    interestStatus: 'notTaken' as const,
    additionalReduction: 0,
  };

  it('should calculate correctly for Method 1 (max interest)', () => {
    const result = calculateInterest(
      baseInput.method,
      baseInput.fromDate,
      baseInput.toDate,
      baseInput.amount,
      baseInput.interestRate,
      baseInput.validityMonths,
      baseInput.interestStatus,
      baseInput.additionalReduction
    );

    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalAmount).toBeGreaterThan(baseInput.amount);
    expect(result.finalInterestRate).toContain('%');
  });

  it('should apply interest taken reduction correctly', () => {
    const result = calculateInterest(
      'method1',
      baseInput.fromDate,
      baseInput.toDate,
      baseInput.amount,
      baseInput.interestRate,
      baseInput.validityMonths,
      'taken',
      0
    );

    expect(result.interestReduction).toBeGreaterThan(0);
    expect(result.totalAmount).toBeLessThan(baseInput.amount + result.totalInterest);
  });

  it('should apply additional reduction correctly', () => {
    const result = calculateInterest(
      'method1',
      baseInput.fromDate,
      baseInput.toDate,
      baseInput.amount,
      baseInput.interestRate,
      baseInput.validityMonths,
      'notTaken',
      200
    );

    expect(result.additionalReduction).toBe(200);
    expect(result.totalAmount).toBeLessThan(baseInput.amount + result.totalInterest);
  });

  it('should not allow negative durations', () => {
    const result = calculateInterest(
      'method1',
      '2025-08-05',
      '2025-06-01',
      baseInput.amount,
      baseInput.interestRate,
      baseInput.validityMonths,
      'notTaken',
      0
    );

    expect(result.totalInterest).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.totalMonths).toMatch(/Invalid/);
  });

  it('should support all 4 methods without error', () => {
    ['method1', 'method2', 'method3', 'method4'].forEach((method) => {
      const result = calculateInterest(
        method as any,
        baseInput.fromDate,
        baseInput.toDate,
        baseInput.amount,
        baseInput.interestRate,
        baseInput.validityMonths,
        baseInput.interestStatus,
        0
      );
      expect(result.totalAmount).toBeGreaterThan(0);
    });
  });
});
