import React from 'react'
import { Card, CardContent } from '../ui/card'

// --- MODIFIED --- The color map now only controls the icon's styling ---
const colorMap = {
  total: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  active: {
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
  },
  closed: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
  },
  overdue: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
  },
}

interface ConsolidatedStatsCardProps {
  title: string;
  icon: React.ReactNode;
  principal: string; // e.g., "₹1,50,00,000"
  interest: string;  // e.g., "₹5,00,000"
  count: number | string;
  status: 'total' | 'active' | 'closed' | 'overdue';
}

export function ConsolidatedStatsCard({
  title,
  icon,
  principal,
  interest,
  count,
  status,
}: ConsolidatedStatsCardProps) {
  const colors = colorMap[status] || colorMap.total;

  return (
    // --- MODIFIED --- All cards now have the same neutral top border color ---
    <Card className="rounded-xl shadow-sm hover:shadow-lg transition-shadow border-t-4 border-slate-200">
      <CardContent className="p-4">
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors.iconBg} ${colors.iconText}`}>
              {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
            <h3 className="text-base font-semibold text-slate-600">{title}</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            {count} Loans
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-slate-200">
          
          <div className="px-2 text-center">
            
            <p className="text-2xl font-bold text-slate-800">{principal}</p>
            <p className="text-xs text-slate-400 mb-1">Principal</p>
          </div>
          
          <div className="px-2 text-center">
            <p className="text-2xl font-bold text-slate-800">{interest}</p>
            <p className="text-xs text-slate-400 mb-1">Interest</p>
          </div>
          
        </div>

      </CardContent>
    </Card>
  )
}