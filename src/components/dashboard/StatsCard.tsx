import React from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  percentage: string
  trend: 'up' | 'down'
  valueColor?: string
  icon?: React.ReactNode
}

export function StatsCard({ 
  title, 
  value, 
  percentage, 
  trend, 
  valueColor = "text-blue-600",
  icon 
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 100000) {
        return `₹${(val / 100000).toFixed(1)}L`
      } else if (val >= 1000) {
        return `₹${(val / 1000).toFixed(1)}K`
      } else if (title.toLowerCase().includes('amount') || title.toLowerCase().includes('earned') || title.toLowerCase().includes('payment')) {
        return `₹${val.toLocaleString()}`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <Card className="border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-600 leading-tight">
            {title}
          </h3>
          {icon || <ArrowUpRight className="w-5 h-5 text-gray-400" />}
        </div>

        <div className="space-y-2">
          <div className={`text-2xl font-bold ${valueColor}`}>
            {formatValue(value)}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-semibold ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {percentage}
              </span>
            </div>
            <span className="text-xs text-gray-500">From last week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}