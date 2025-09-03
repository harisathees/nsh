import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { RepledgeEntry, Loan, Customer, Jewel, Bank } from '../lib/supabase'

interface RepledgeData {
  repledge: RepledgeEntry | null
  loan: Loan | null
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
      try {
        setLoading(true)
        setError(null)

        // Fetch repledge entry
        const { data: repledgeData, error: repledgeError } = await supabase
          .from('repledge_entries')
          .select('*')
          .eq('loan_id', loanId)
          .maybeSingle()

        if (repledgeError) throw repledgeError

        // Fetch loan details
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select('*')
          .eq('id', loanId)
          .maybeSingle()


        if (loanError) throw loanError

        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', loanData.customer_id)
          .maybeSingle()

        if (customerError) throw customerError

        // Fetch jewel details
        const { data: jewelData, error: jewelError } = await supabase
          .from('jewels')
          .select('*')
          .eq('loan_id', loanId)

        if (jewelError) throw jewelError

        // Fetch bank details if bank_id exists
        let bankData = null
        if (repledgeData.bank_id) {
          const { data: bank, error: bankError } = await supabase
            .from('banks')
            .select('*')
            .eq('id', repledgeData.bank_id)
           .maybeSingle()

          if (!bankError) {
            bankData = bank
          }
        }

        setData({
          repledge: repledgeData,
          loan: loanData,
          customer: customerData,
          jewels: jewelData || [],
          bank: bankData
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (loanId) {
      fetchData()
    }
  }, [loanId])

  return { data, loading, error }
}