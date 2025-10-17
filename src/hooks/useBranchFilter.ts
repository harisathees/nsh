import { useAuth } from '../context/AuthContext';

export const useBranchFilter = () => {
  const { branch } = useAuth();

  const addBranchFilter = (query: any) => {
    if (branch?.id) {
      return query.eq('branch_id', branch.id);
    }
    return query;
  };

  const getBranchId = () => branch?.id || null;

  return {
    branchId: branch?.id,
    branchName: branch?.name,
    branchCode: branch?.code,
    addBranchFilter,
    getBranchId
  };
};
