import React from 'react'
import { Card, CardContent } from '../ui/card'

// A map to associate status with colors for icons
const colorMap = {
  total: 'bg-blue-100 text-blue-600',
  active: 'bg-orange-100 text-orange-600',
  closed: 'bg-green-100 text-green-600',
  overdue: 'bg-red-100 text-red-600',
}

interface StatsCardProps {
  title: string
  icon: React.ReactNode
  amount: string            // The main, large value (e.g., currency)
  count: number | string    // The secondary value (e.g., loan count)
  secondaryLabel?: string   // A small label like "Principal Amount"
  status: 'total' | 'active' | 'closed' | 'overdue'
}

export function StatsCard({
  title,
  icon,
  amount,
  count,
  secondaryLabel = "Principal Amount",
  status,
}: StatsCardProps) {
  const colors = colorMap[status] || colorMap.total

  return (
    <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Top Row: Icon and Count */}
        <div className="flex justify-between items-start mb-2">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colors}`}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-700">{count}</p>
            <p className="text-xs text-gray-400">Count</p>
          </div>
        </div>
        
        {/* Bottom Row: Title and Main Amount */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{amount}</p>
          {secondaryLabel && <p className="text-xs text-gray-400">{secondaryLabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}