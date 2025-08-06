// src/screens/RedirectBasedOnAuth.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const RedirectBasedOnAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        navigate('/dashboard'); // 🔐 user is logged in
      } else {
        navigate('/login'); // 🚪 not logged in
      }
    };

    checkSession();
  }, [navigate]);

  return null;
};
