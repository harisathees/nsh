import { useEffect, useState } from 'react'
import { supabase, type PledgeData, type Customer, type Loan, type Jewel, type Calculation } from '../lib/supabase'
import { calculateLoanStatus } from '../lib/loanUtils'

export const usePledgeData = (loanId?: string) => {
  const [data, setData] = useState<PledgeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPledgeData = async () => {
      try {
        setLoading(true)
        setError(null)

        // If no loanId provided, get the first loan for demo
        let targetLoanId = loanId
        
        if (!targetLoanId) {
          const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (loansError) throw loansError
          targetLoanId = loans?.id
        }

        if (!targetLoanId) {
          throw new Error('No loans found in database')
        }

        // Fetch loan with customer data
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select(`
            *,
            customers (*)
          `)
          .eq('id', targetLoanId)
          .single()

        if (loanError) throw loanError

        // Fetch jewels for this loan
        const { data: jewelsData, error: jewelsError } = await supabase
          .from('jewels')
          .select('*')
          .eq('loan_id', targetLoanId)

        if (jewelsError) throw jewelsError

        // Calculate actual loan status based on date and validity
        const actualStatus = calculateLoanStatus(
          loanData.date,
          loanData.validity_months,
          loanData.status
        );

        // Update loan status in the data
        const updatedLoanData = {
          ...loanData,
          status: actualStatus
        };

        // Fetch calculation data if loan is closed
        let calculationData: Calculation | null = null
        if (actualStatus === 'Closed') {
          const { data: calcData, error: calcError } = await supabase
            .from('calculations')
            .select('*')
            .eq('loan_id', targetLoanId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (!calcError && calcData) {
            calculationData = calcData as Calculation
          }
        }

        const pledgeData: PledgeData = {
          customer: loanData.customers as Customer,
          loan: updatedLoanData as Loan,
          jewels: jewelsData as Jewel[],
          calculation: calculationData || undefined
        }

        setData(pledgeData)
      } catch (err) {
        console.error('Error fetching pledge data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchPledgeData()
  }, [loanId])

  return { data, loading, error }
}