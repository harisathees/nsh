import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { PlusCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PledgeEntry() {
  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        {/* <h1 className="text-3xl font-bold text-slate-800">Pledge Entry</h1> */}
        {/* <p className="text-slate-500 mt-1">Create new loan pledges or search for existing customer records.</p> */}
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Option 1: Create New Pledge */}
        <Link to="/create-pledge" className="group">
          <Card className="rounded-2xl shadow-sm h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-indigo-500">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="p-4 bg-indigo-100 rounded-full text-indigo-600 mb-4 transition-transform duration-300 group-hover:scale-110">
                <PlusCircle className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Create New Pledge
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                {/* Start a new loan entry for a new or existing customer. */}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Option 2: Find Existing Pledge/Customer */}
        {/* <Link to="/customers" className="group">
          <Card className="rounded-2xl shadow-sm h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-slate-500">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="p-4 bg-slate-100 rounded-full text-slate-600 mb-4 transition-transform duration-300 group-hover:scale-110">
                <Search className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Find Existing Pledge
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                Search for an existing customer or loan to view details.
              </p>
            </CardContent>
          </Card>
        </Link> */}

      </div>
    </div>
  )
}