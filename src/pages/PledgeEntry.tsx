import React from 'react'
import { Card, CardContent } from '../components/ui/card'
import { PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'


export function PledgeEntry() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-1 text-sm text-gray-500">
        <span>Pledge Entry</span>
      </nav>

      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-8 text-center">
          
          <PlusCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Pledge Entry
          </h2>

          <p className="text-gray-600 mb-6">
            Create new loan entries and manage pledge details
          </p>

          <Link to="/create-pledge">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create New Pledge
            </button>
          </Link>

        </CardContent>
      </Card>
    </div>
  )
}