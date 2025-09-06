// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for session changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  // 🔒 Redirect to login if no session
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
