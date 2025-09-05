import React from 'react'
import { Card, CardContent } from '../ui/card'

interface LoadingCardProps {
  title: string
  rows?: number
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ title, rows = 6 }) => {
  return (
    <section>
      <h2 className="font-inter font-normal text-gray-1 text-sm mb-4">
        {title}
      </h2>
      <Card className="border border-solid border-[#1f16164a] rounded-2xl">
        <CardContent className="p-5 space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}