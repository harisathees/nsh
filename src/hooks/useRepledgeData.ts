import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { RepledgeEntry, Loan, Customer, Jewel, Bank } from '../lib/supabase'

interface RepledgeData {
  repledge: RepledgeEntry | null
  loan: (Loan & { customers: Customer | null }) | null // Nest customer in loan
  customer: Customer | null
  jewels: Jewel[]
  bank: Bank | null
}

export const useRepledgeData = (loanId: string) => {
  const [data, setData] = useState<RepledgeData>({
    repledge: null,
    loan: null,
    customer: null,
    jewels: [],
    bank: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!loanId) {
        setLoading(false);
        setError("No Loan ID provided.");
        return;
      }

      try {
        setLoading(true)
        setError(null)

        // Step 1: Fetch the main loan and its associated customer in one query.
        // This is the most critical record. If it doesn't exist, we can't proceed.
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select('*, customers(*)') // Use Supabase to join customers table
          .eq('id', loanId)
          .single(); // .single() will error if no loan is found, which is what we want.

        if (loanError) throw loanError;

        // Step 2: Now that we have a valid loan, fetch other related data in parallel.
        const [repledgeResult, jewelsResult] = await Promise.all([
          supabase.from('repledge_entries').select('*').eq('loan_id', loanId).maybeSingle(),
          supabase.from('jewels').select('*').eq('loan_id', loanId)
        ]);
        
        const { data: repledgeData, error: repledgeError } = repledgeResult;
        const { data: jewelData, error: jewelError } = jewelsResult;

        if (repledgeError) throw repledgeError;
        if (jewelError) throw jewelError;

        // Step 3: Fetch bank details only if a bank_id exists on the repledge entry.
        let bankData = null;
        if (repledgeData?.bank_id) {
          const { data: bank, error: bankError } = await supabase
            .from('banks')
            .select('*')
            .eq('id', repledgeData.bank_id)
            .single();

          if (bankError) {
             console.warn("Could not fetch bank details:", bankError.message);
          } else {
             bankData = bank;
          }
        }

        setData({
          repledge: repledgeData,
          loan: loanData,
          customer: loanData.customers, // The customer is now nested inside the loan data
          jewels: jewelData || [],
          bank: bankData
        })
      } catch (err) {
        console.error("Error fetching repledge data:", err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [loanId])

  return { data, loading, error }
}