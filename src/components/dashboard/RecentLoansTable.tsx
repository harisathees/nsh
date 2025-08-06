import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableRow } from '../ui/table'
import { type Loan } from '../../lib/supabase'
import {  useNavigate } from "react-router-dom";

interface RecentLoansTableProps {
  loans: Loan[]
  loading: boolean
}

export function RecentLoansTable({ loans, loading }: RecentLoansTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'Overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'Closed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  if (loading) {
    return (
      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Loans</h2>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
 const navigate = useNavigate();
  return (
    <Card className="border border-gray-200 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Loans</h2>
          <div className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 cursor-pointer">
            <button className="text-sm font-medium"  onClick={() => navigate('/customers')}>Show All</button>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent loans found</p>
          </div>
        ) : (
          <Table>
            <TableBody>
              {loans.slice(0, 5).map((loan) => (
                <TableRow key={loan.id} className="border-b last:border-0">
                  <TableCell className="py-3 pl-0">
                    <span className="text-sm font-medium text-blue-600">
                      {loan.loan_no || `L-${loan.id.slice(0, 8)}`}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-sm text-gray-800">
                      {loan.customer?.name || 'Unknown Customer'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right pr-0">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{loan.amount?.toLocaleString() || '0'}
                      </span>
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}