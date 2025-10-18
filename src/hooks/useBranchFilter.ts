import { useAuth } from '../context/AuthContext';

export const useBranchFilter = () => {
  const { selectedBranch, isAdmin } = useAuth();

  const addBranchFilter = (query: any) => {
    if (!isAdmin && selectedBranch?.id) {
      return query.eq('branch_id', selectedBranch.id);
    }
    if (isAdmin && selectedBranch?.id) {
      return query.eq('branch_id', selectedBranch.id);
    }
    return query;
  };

  const getBranchId = () => selectedBranch?.id || null;

  const getActiveBranchId = () => {
    return selectedBranch?.id || null;
  };

  return {
    branchId: selectedBranch?.id,
    branchName: selectedBranch?.name,
    branchCode: selectedBranch?.code,
    isAdmin,
    addBranchFilter,
    getBranchId,
    getActiveBranchId
  };
};
