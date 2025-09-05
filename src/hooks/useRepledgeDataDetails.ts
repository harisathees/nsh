import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface RepledgeWithDetails {
  id: string
  loan_id: string
  loan_no: string | null
  re_no: string | null
  amount: number | null
  created_at: string | null
  bank_name: string | null
  customer_name: string | null
  customer_photo: string | null
  customer_mobile: string | null
}

export const useRepledgeData = (
  searchTerm: string = '',
  page: number = 1,
  itemsPerPage: number = 10,
  bankId: string = 'all',
  startDate: string = '',
  endDate: string = ''
) => {
  const [data, setData] = useState<RepledgeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // We use useCallback to prevent this function from being recreated on every render
  const fetchRepledgeData = useCallback(async (currentSearchTerm: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Prepare parameters for our new database function
      const params = {
        search_text: currentSearchTerm.trim() || null,
        bank_id_filter: bankId !== 'all' ? bankId : null,
        start_date_filter: startDate ? new Date(startDate).toISOString() : null,
        end_date_filter: endDate ? new Date(endDate).toISOString() : null,
      };

      // Call the database function (RPC) instead of building a complex query
      let query = supabase.rpc('search_repledge_details', params, { count: 'exact' })

      // Add pagination and ordering
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to).order('created_at', { ascending: false })

      const { data: resultData, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setData(resultData || [])
      setTotalCount(count || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Error fetching repledge data:', err)
    } finally {
      setLoading(false)
    }
  }, [page, itemsPerPage, bankId, startDate, endDate]) // Dependencies for the function

  // This useEffect handles the search term with a debounce to improve performance
  useEffect(() => {
    // Wait 300ms after the user stops typing before making an API call
    const handler = setTimeout(() => {
      fetchRepledgeData(searchTerm)
    }, 300)

    return () => {
      clearTimeout(handler) // Clear the timeout if the user types again
    }
  }, [searchTerm, fetchRepledgeData]) // Re-run when search term or the fetch function changes

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: () => fetchRepledgeData(searchTerm), // Allow manual refetching
  }
}