import React from 'react'
import { Card, CardContent } from '../ui/card'
import { TrendingUp, Gem, Disc } from 'lucide-react' // Using more distinct icons

interface RatesCardProps {
  goldRate: number
  silverRate: number
}

// Helper to format currency
const formatRate = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export function RatesCard({ goldRate, silverRate }: RatesCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm overflow-hidden border-slate-200">
      {/* Header Section */}
      <header className="flex items-center gap-2 p-4 bg-slate-800 text-white">
        <TrendingUp size={20} className="text-emerald-400" />
        <h3 className="text-base font-semibold">Live Metal Rates</h3>
      </header>
      
      <CardContent className="p-0">
        <div className="flex flex-col">

          {/* Gold Rate Section */}
          <div className="flex items-center gap-4 p-5">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg text-white shadow-md">
                <Gem size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Gold (per gram)</p>
              <p className="text-2xl font-bold text-slate-800">{formatRate(goldRate)}</p>
            </div>
          </div>
          
          <div className="mx-5 border-t border-slate-100"></div>

          {/* Silver Rate Section */}
          <div className="flex items-center gap-4 p-5">
            <div className="p-3 bg-gradient-to-br from-slate-400 to-gray-500 rounded-lg text-white shadow-md">
                <Disc size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Silver (per gram)</p>
              <p className="text-2xl font-bold text-slate-800">{formatRate(silverRate)}</p>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}