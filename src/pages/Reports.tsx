import React from 'react'
import { Card, CardContent } from '../components/ui/card'
import { FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react'

export function Reports() {
  const reportTypes = [
    // {
    //   title: 'Loan Summary Report',
    //   description: 'Overview of all loans with status breakdown',
    //   icon: <BarChart3 className="w-8 h-8 text-blue-500" />
    // },
    {
      title: 'Annual Report',
      description: 'Track interest earned over time periods',
      icon: <TrendingUp className="w-8 h-8 text-green-500" />
    },
    // {
    //   title: 'Customer Analysis',
    //   description: 'Customer loan history and patterns',
    //   icon: <PieChart className="w-8 h-8 text-purple-500" />
    // },
    {
      title: 'Overdue Loans Report',
      description: 'List of overdue loans requiring attention',
      icon: <FileText className="w-8 h-8 text-red-500" />
    }
  ]

  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-1 text-sm text-gray-500">
        <span>Reports</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="border border-gray-200 rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {report.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}