import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  branch: Branch | null;
  selectedBranch: Branch | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setSelectedBranch: (branch: Branch | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        setUser(auth.user);
        setBranch(auth.branch);
        setSelectedBranchState(auth.selectedBranch || auth.branch);
      } catch (e) {
        sessionStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  const setSelectedBranch = (newBranch: Branch | null) => {
    setSelectedBranchState(newBranch);
    const storedAuth = sessionStorage.getItem('auth');
    if (storedAuth) {
      const auth = JSON.parse(storedAuth);
      auth.selectedBranch = newBranch;
      sessionStorage.setItem('auth', JSON.stringify(auth));
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_username: username,
        p_password: password
      });

      if (error) {
        return { success: false, error: 'Authentication failed. Please try again.' };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Invalid username or password.' };
      }

      const authData = data[0];
      const userData: User = {
        id: authData.user_id,
        username: authData.username,
        fullName: authData.full_name,
        role: authData.role
      };

      const branchData: Branch = {
        id: authData.branch_id,
        name: authData.branch_name,
        code: authData.branch_code
      };

      setUser(userData);
      setBranch(branchData);
      setSelectedBranchState(branchData);

      sessionStorage.setItem('auth', JSON.stringify({
        user: userData,
        branch: branchData,
        selectedBranch: branchData,
        timestamp: new Date().getTime()
      }));

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const logout = () => {
    setUser(null);
    setBranch(null);
    setSelectedBranchState(null);
    sessionStorage.removeItem('auth');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        branch,
        selectedBranch,
        isAuthenticated: !!user && !!branch,
        isLoading,
        isAdmin,
        login,
        logout,
        setSelectedBranch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
