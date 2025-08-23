import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator'; // Assuming you have a Separator component from shadcn/ui

const colorMap = {
  total: 'text-blue-600 border-blue-200',
  active: 'text-orange-600 border-orange-200',
  closed: 'text-green-600 border-green-200',
  overdue: 'text-red-600 border-red-200',
};

interface ConsolidatedStatsCardProps {
  title: string;
  icon: React.ReactNode;
  principal: string;
  interest: string;
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
    <Card className={`rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 ${colors}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className={colors}>{icon}</div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>

        {/* Main Value */}
        <p className="text-3xl font-bold text-gray-800">{principal}</p>
        <p className="text-sm text-gray-500">Principal Amount</p>

        <Separator className="my-3" />

        {/* Secondary Details */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-500">Interest</p>
            <p className="font-semibold text-gray-700">{interest}</p>
          </div>
          <div>
            <p className="text-gray-500">Loan Count</p>
            <p className="font-semibold text-gray-700 text-right">{count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}