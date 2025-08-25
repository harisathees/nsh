import React from 'react'
import { ArrowUpRight, List } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '../ui/table'
import { type Loan } from '../../lib/supabase'
import { useNavigate } from "react-router-dom";

interface RecentLoansTableProps {
  loans: Loan[]
  loading: boolean
}

export function RecentLoansTable({ loans, loading }: RecentLoansTableProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'Overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'Closed':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100'
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100'
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <List size={20} />
            Recent Loans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex flex-col gap-1.5 w-1/3">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
                <List size={20} />
                Recent Loans
            </CardTitle>
            <button 
                onClick={() => navigate('/customers')} 
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                Show All
                <ArrowUpRight className="w-4 h-4" />
            </button>
        </CardHeader>
      <CardContent className="p-4 pt-0">
        {loans.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="font-medium">No recent loans found.</p>
            <p className="text-sm">New loans will appear here as they are created.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-1/3">Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {loans.slice(0, 5).map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-800">{loan.customer?.name || 'Unknown Customer'}</span>
                        <span className="text-xs text-slate-500 font-mono">{loan.loan_no || `L-${loan.id.slice(0, 4)}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-700">
                    ₹{loan.amount?.toLocaleString('en-IN') || '0'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={getStatusColor(loan.status)}>
                      {loan.status}
                    </Badge>
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