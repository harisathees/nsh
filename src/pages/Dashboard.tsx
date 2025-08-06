import React, { useEffect, useState } from 'react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { RatesCard } from '../components/dashboard/RatesCard'
import { RecentLoansTable } from '../components/dashboard/RecentLoansTable'
import { useDashboardStats, useRecentLoans } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react'

export function Dashboard() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { loans, loading: loansLoading } = useRecentLoans()

  const [goldRate, setGoldRate] = useState<number>(0)
  const [silverRate, setSilverRate] = useState<number>(0)

  useEffect(() => {
  const fetchRates = async () => {
    const { data, error } = await supabase
      .from('metal_rates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching metal rates:', error);
      return;
    }

    if (data) {
      const goldRow = data.find(r => r.metal_type === 'Gold');
      const silverRow = data.find(r => r.metal_type === 'Silver');
      setGoldRate(Number(goldRow?.rate ?? 0));
      setSilverRate(Number(silverRow?.rate ?? 0));
    }
  };
  fetchRates();
}, []);


  const statsCards = [
    {
      title: 'Active Loans',
      value: stats.activeLoans,
      percentage: '3.6%',
      trend: 'up' as const,
      icon: <CreditCard className="w-5 h-5 text-blue-500" />
    },
    {
      title: 'Total Amount Loaned',
      value: stats.totalAmountLoaned,
      percentage: '10.6%',
      trend: 'up' as const,
      icon: <DollarSign className="w-5 h-5 text-green-500" />
    },
    {
      title: 'Closed Loans',
      value: stats.closedLoans,
      percentage: '1.5%',
      trend: 'down' as const,
      icon: <CheckCircle className="w-5 h-5 text-gray-500" />
    },
    {
      title: 'Overdue Loans',
      value: stats.overdueLoans,
      percentage: '3.6%',
      trend: 'up' as const,
      valueColor: 'text-red-600',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      title: 'Interest Earned',
      value: stats.interestEarned,
      percentage: '1.5%',
      trend: 'up' as const,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      percentage: '1.5%',
      trend: 'up' as const,
      valueColor: 'text-orange-600',
      icon: <Clock className="w-5 h-5 text-orange-500" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-1 text-sm text-gray-500">
        <span>Dashboard</span>
      </nav>

      {/* Rates Card */}
      <RatesCard goldRate={goldRate} silverRate={silverRate} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={statsLoading ? '...' : card.value}
            percentage={card.percentage}
            trend={card.trend}
            valueColor={card.valueColor}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Recent Loans */}
      <RecentLoansTable loans={loans} loading={loansLoading} />
    </div>
  )
}
