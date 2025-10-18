import React, { useState, useEffect } from 'react'
import { Menu, LogOut, Building2, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface TopNavbarProps {
  onMenuClick: () => void
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user, branch, selectedBranch, isAdmin, logout, setSelectedBranch } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllBranches();
    }
  }, [isAdmin]);

  const fetchAllBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAllBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBranchChange = (branchToSelect: Branch) => {
    setSelectedBranch(branchToSelect);
    setShowBranchDropdown(false);
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {isAdmin ? (
            <div className="relative">
              <button
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="hidden md:flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  {selectedBranch?.name || 'All Branches'}
                </span>
                <ChevronDown className="w-4 h-4 text-blue-600" />
              </button>

              {showBranchDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Select Branch
                  </div>
                  {allBranches.map((branchOption) => (
                    <button
                      key={branchOption.id}
                      onClick={() => handleBranchChange(branchOption)}
                      className={`w-full flex items-center space-x-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                        selectedBranch?.id === branchOption.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{branchOption.name}</span>
                      <span className="text-xs text-gray-500">({branchOption.code})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">{selectedBranch?.name || 'Branch'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {getInitials(user?.fullName || 'User')}
                </AvatarFallback>
              </Avatar>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {user?.role} - {branch?.name}
                  </p>
                  {isAdmin && (
                    <div className="mt-2 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700 font-semibold">
                      Admin - Can view all branches
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}