import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface RepledgeWithDetails {
  id: string
  loan_id: string | null
  loan_no: string | null
  re_no: string | null
  amount: number | null
  created_at: string | null
  status: string | null
  bank_name: string | null
  customer_name: string | null
  customer_photo: string | null
  customer_mobile: string | null
}

export const useRepledgeData = (searchTerm: string = '', page: number = 1, itemsPerPage: number = 10) => {
  const [data, setData] = useState<RepledgeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchRepledgeData()
  }, [searchTerm, page, itemsPerPage])

  const fetchRepledgeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build the query with joins
      let query = supabase
        .from('repledge_entries')
        .select(`
          id,
          loan_id,
          loan_no,
          re_no,
          amount,
          created_at,
          status,
          banks!repledge_entries_bank_id_fkey (
            name
          ),
          loans!repledge_entries_loan_id_fkey (
            customer_id,
            customers (
              name,
              photo_url,
              mobile_no
            )
          )
        `, { count: 'exact' })

      // Apply search filter if provided
      if (searchTerm.trim()) {
        query = query.or(`
          loan_no.ilike.%${searchTerm}%,
          re_no.ilike.%${searchTerm}%,
          loans.customers.name.ilike.%${searchTerm}%,
          loans.customers.mobile_no.ilike.%${searchTerm}%
        `)
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      // Order by created_at descending
      query = query.order('created_at', { ascending: false })

      const { data: repledgeData, error: fetchError, count } = await query

      if (fetchError) {
        throw fetchError
      }

      // Transform the data to match our interface
      const transformedData: RepledgeWithDetails[] = (repledgeData || []).map((item: any) => ({
        id: item.id,
        loan_id: item.loan_id, 
        loan_no: item.loan_no,
        re_no: item.re_no,
        amount: item.amount,
        created_at: item.created_at,
        status: item.status,
        bank_name: item.banks?.name || null,
        customer_name: item.loans?.customers?.name || null,
        customer_photo: item.loans?.customers?.photo_url || null,
        customer_mobile: item.loans?.customers?.mobile_no || null,
      }))

      setData(transformedData)
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching repledge data:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchRepledgeData
  }
}