import React, { useState, useEffect } from 'react';
import { ConsolidatedStatsCard } from '../components/dashboard/ConsolidatedStatsCard';
// Re-import the hooks and components you need
import { useDashboardStats, useRecentLoans } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { RatesCard } from '../components/dashboard/RatesCard';
import { RecentLoansTable } from '../components/dashboard/RecentLoansTable';
import { DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Helper to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export function Dashboard() {
    // Data fetching for all components
    const { stats, loading: statsLoading } = useDashboardStats();
    const { loans: recentLoans, loading: loansLoading } = useRecentLoans();
    const [rates, setRates] = useState({ gold: 0, silver: 0 });
    const [ratesLoading, setRatesLoading] = useState(true);

    // useEffect hook to fetch metal rates
    useEffect(() => {
        const fetchRates = async () => {
            setRatesLoading(true);
            const { data, error } = await supabase
                .from('metal_rates')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching metal rates:', error);
            } else if (data) {
                const goldRow = data.find(r => r.metal_type === 'Gold');
                const silverRow = data.find(r => r.metal_type === 'Silver');
                setRates({
                    gold: Number(goldRow?.rate ?? 0),
                    silver: Number(silverRow?.rate ?? 0),
                });
            }
            setRatesLoading(false);
        };
        fetchRates();
    }, []);

    const loading = statsLoading || loansLoading || ratesLoading;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-blue-700 font-semibold text-lg">Loading Dashboard...</span>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            {/* <div>
                <h1 className="text-2xl font-bold text-gray-800">Loan Management Dashboard</h1>
                <p className="text-sm text-gray-500">Overview of all loan activities and performance metrics</p>
            </div> */}

            {/* Secondary Grid: Rates and other potential cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* This is a great spot for a chart in the future */}
                    {/* <Card className="h-full">
                        <CardHeader><CardTitle>Portfolio Health</CardTitle></CardHeader>
                        <CardContent><p>A chart showing portfolio composition would go here.</p></CardContent>
                    </Card> */}
                </div>
                {/* Rates Card is re-added here */}
                <RatesCard goldRate={rates.gold} silverRate={rates.silver} />
            </div>

            {/* Consolidated KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ConsolidatedStatsCard title="Total Portfolio" icon={<DollarSign size={24} />} principal={formatCurrency(stats.totalPrincipal)} interest={formatCurrency(stats.totalInterest)} count={stats.totalLoansCount} status="total" />
                <ConsolidatedStatsCard title="Active Loans" icon={<Clock size={24} />} principal={formatCurrency(stats.activePrincipal)} interest={formatCurrency(stats.pendingInterest)} count={stats.activeLoansCount} status="active" />
                <ConsolidatedStatsCard title="Closed Loans" icon={<CheckCircle size={24} />} principal={formatCurrency(stats.closedPrincipal)} interest={formatCurrency(stats.collectedInterest)} count={stats.closedLoansCount} status="closed" />
                <ConsolidatedStatsCard title="Overdue Loans" icon={<AlertTriangle size={24} />} principal={formatCurrency(stats.overduePrincipal)} interest={formatCurrency(stats.overdueInterest)} count={stats.overdueLoansCount} status="active" />
            </div>

            {/* Recent Loans Table is re-added here at the bottom */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Loans</h2>
                <RecentLoansTable loans={recentLoans} loading={loansLoading} />
            </div>
        </div>
    );
}