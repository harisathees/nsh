import React from 'react'
import { Card, CardContent } from '../ui/card'

interface RatesCardProps {
  goldRate: number
  silverRate: number
}

export function RatesCard({ goldRate, silverRate }: RatesCardProps) {
  return (
    <Card className="border border-gray-200 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-yellow-600 font-medium">
              Gold rate Today
            </span>
            <span className="text-lg font-bold text-gray-800">
              ₹{goldRate.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-500 font-medium">
              Silver rate Today
            </span>
            <span className="text-lg font-bold text-gray-800">
              ₹{silverRate.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}