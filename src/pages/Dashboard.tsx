import React, { useState, useEffect } from 'react';
import { useDashboardStats, useRecentLoans } from '../hooks/useSupabase'; 
import { supabase } from '../lib/supabase';
import { ConsolidatedStatsCard } from '../components/dashboard/ConsolidatedStatsCard';
import { RatesCard } from '../components/dashboard/RatesCard';
import { RecentLoansTable } from '../components/dashboard/RecentLoansTable';
import { DollarSign, Clock, CheckCircle, AlertTriangle, AlertCircle as AlertIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// A themed loading component
const GoldCoinSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]" aria-label="Loading dashboard">
    <svg className="coin-spinner w-16 h-16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4"/>
      <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
    </svg>
    <p className="mt-4 text-sm font-semibold text-amber-800">Loading Dashboard...</p>
  </div>
);

// A component to display when data fetching fails
const ErrorDisplay: React.FC<{ message?: string }> = ({ message = "Something went wrong." }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertIcon className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Could Not Load Dashboard</h2>
        <p className="text-slate-500 mt-2">{message}<br/>Please check your connection and try again.</p>
    </div>
);

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

export function Dashboard() {
    const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
    const { loans: recentLoans, loading: loansLoading, error: loansError } = useRecentLoans();
    const [rates, setRates] = useState({ gold: 0, silver: 0 });
    const [ratesLoading, setRatesLoading] = useState(true);
    const [ratesError, setRatesError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            setRatesLoading(true);
            setRatesError(null);
            const { data, error } = await supabase.from('metal_rates').select('*').order('updated_at', { ascending: false });
            if (error) {
                console.error('Error fetching metal rates:', error);
                setRatesError(error);
            } else if (data) {
                const goldRow = data.find(r => r.metal_type === 'Gold');
                const silverRow = data.find(r => r.metal_type === 'Silver');
                setRates({ gold: Number(goldRow?.rate ?? 0), silver: Number(silverRow?.rate ?? 0) });
            }
            setRatesLoading(false);
        };
        fetchRates();
    }, []);

    const loading = statsLoading || loansLoading || ratesLoading;

    // --- Animation Variants ---
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
    };
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    if (loading) {
        return <GoldCoinSpinner />;
    }

    if (statsError || loansError || ratesError || !stats || !recentLoans) {
        return <ErrorDisplay message={statsError?.message || loansError?.message || ratesError?.message || "Failed to fetch required data."} />;
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-100 min-h-screen">
            <div className="lg:col-span-1">
                <RatesCard goldRate={rates.gold} silverRate={rates.silver} />
            </div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.div variants={itemVariants}>
                    <ConsolidatedStatsCard title="Total Portfolio" icon={<DollarSign size={24} />} principal={formatCurrency(stats.totalPrincipal)} interest={formatCurrency(stats.totalInterest)} count={stats.totalLoansCount} status="total" />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <ConsolidatedStatsCard title="Active Loans" icon={<Clock size={24} />} principal={formatCurrency(stats.activePrincipal)} interest={formatCurrency(stats.pendingInterest)} count={stats.activeLoansCount} status="active" />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <ConsolidatedStatsCard title="Closed Loans" icon={<CheckCircle size={24} />} principal={formatCurrency(stats.closedPrincipal)} interest={formatCurrency(stats.collectedInterest)} count={stats.closedLoansCount} status="closed" />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <ConsolidatedStatsCard title="Overdue Loans" icon={<AlertTriangle size={24} />} principal={formatCurrency(stats.overduePrincipal)} interest={formatCurrency(stats.overdueInterest)} count={stats.overdueLoansCount} status="overdue" />
                </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <h2 className="text-xl text-slate-800 mb-4">Recent Loans</h2>
                    <RecentLoansTable loans={recentLoans} loading={loansLoading} />
                </div>
            </div>
        </div>
    );
}