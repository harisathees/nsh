import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { supabase, type RepledgeEntry } from '../lib/supabase';

export const useRepledge = (repledgeId?: string) => {
    const [repledge, setRepledge] = useState<RepledgeEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- WRAPPED IN useCallback ---
    const fetchRepledge = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const { data, error } = await supabase
                .from('repledge_entries')
                .select(`
                    *,
                    banks (
                        name,
                        code,
                        branch
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setRepledge(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch repledge');
            setRepledge(null);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means the function is created only once

    // --- WRAPPED IN useCallback ---
    const searchRepledgeByLoanId = useCallback(async (loanId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const { data, error } = await supabase
                .from('repledge_entries')
                .select(`
                    *,
                    banks (
                        name,
                        code,
                        branch
                    )
                `)
                .eq('loan_id', loanId)
                .single();

            if (error) throw error;
            setRepledge(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Repledge not found');
            setRepledge(null);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means the function is created only once

    useEffect(() => {
        if (repledgeId) {
            fetchRepledge(repledgeId);
        }
    }, [repledgeId, fetchRepledge]); // Added fetchRepledge here for correctness

    return {
        repledge,
        loading,
        error,
        fetchRepledge,
        searchRepledgeByLoanId,
        refetch: () => repledgeId && fetchRepledge(repledgeId)
    };
};