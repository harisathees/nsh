// src/auth/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setLoading(false)
    }

    checkSession()
  }, [])

  if (loading) return <div className="p-4">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/" /> // redirect to login

  return children
}
