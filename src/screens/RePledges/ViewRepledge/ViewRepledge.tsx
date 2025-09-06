import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Landmark, ShieldCheck, Gem, X } from "lucide-react";

// UI Components
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"; // Added CardHeader & CardTitle if available

// Custom Components & Hooks
import { LoadingCard } from "../../../components/customerpic&loadingcardforviewrepledge/LoadingCard";
import { CustomerPhoto } from "../../../components/customerpic&loadingcardforviewrepledge/CustomerPhoto";
import { useRepledgeData } from "../../../hooks/useRepledgeData";
import { supabase } from "../../../lib/supabase";

// A reusable component for displaying key-value data pairs. It lives only in this file.
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-b-0">
    <p className="text-gray-500">{label}</p>
    <p className="font-medium text-gray-800 text-right">{value || "-"}</p>
  </div>
);


export const ViewRepledge = (): JSX.Element => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useRepledgeData(loanId || '');

  // MODIFIED: Reverted to a single delete handler using window.confirm
  const handleDelete = async () => {
    // Using standard browser confirmation dialog
    if (!loanId || !window.confirm('Are you sure you want to delete this repledge entry? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('repledge_entries')
        .delete()
        .eq('loan_id', loanId);

      if (error) throw error;

      alert('Repledge entry deleted successfully');
      navigate('/');
    } catch (err) {
      alert('Failed to delete repledge entry: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Helper functions remain the same
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatWeight = (weight: number | null) => {
    if (weight == null) return '-';
    return `${weight}g`;
  };

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen w-full max-w-[393px] mx-auto flex flex-col items-center justify-center p-6">
        <p className="text-red-600 text-center mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/re-pledge-entry/details')}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen w-full max-w-[393px] mx-auto lg:max-w-2xl">
        <header className="bg-black rounded-b-[47px] h-[73px] flex items-center justify-between px-6 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/re-pledge-entry/details')}
            className="text-white hover:bg-white rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">
            View Repledge
          </h1>
          <div className="w-9"></div> {/* Spacer */}
        </header>

        {loading ? (
          <main className="p-4 space-y-4">
             <LoadingCard title="Loading Customer Details..." />
             <LoadingCard title="Loading Repledge Details..." rows={4} />
             <LoadingCard title="Loading Loan Details..." rows={4} />
          </main>
        ) : (
          <main className="px-4 py-6 space-y-6 pb-32">
            {/* Customer Hero Section */}
            <section className="text-center">
              <CustomerPhoto
                photoUrl={data.customer?.photo_url ?? undefined}
                customerName={data.customer?.name ?? undefined}
                className="w-24 h-24 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900">{data.customer?.name}</h2>
              <p className="text-sm text-gray-500">Loan No: {data.loan?.loan_no}</p>
            </section>
            
            {/* Repledge Details Card */}
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-gray-100 p-4">
                 <CardTitle className="text-base font-semibold flex items-center gap-2">
                   <Landmark className="w-5 h-5 text-blue-600" />
                   Repledge Details
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-1">
                  <InfoRow label="Bank" value={data.bank?.name} />
                  <InfoRow label="Repledge No" value={data.repledge?.re_no} />
                  <InfoRow label="Repledge Amount" value={formatCurrency(data.repledge?.amount)} />
                  <InfoRow label="Start Date" value={formatDate(data.repledge?.start_date)} />
                  <InfoRow label="End Date" value={formatDate(data.repledge?.end_date)} />
                  <InfoRow label="Interest" value={`${data.repledge?.interest_percent || '-'}%`} />
                  <InfoRow label="Interest (After Validity)" value={`${data.repledge?.after_interest_percent || '-'}%`} />
                  <InfoRow label="Processing Fee" value={formatCurrency(data.repledge?.processing_fee)} />
                  <InfoRow label="Status" value={data.repledge?.status} />
              </CardContent>
            </Card>

            {/* Loan Details Card */}
            <Card className="overflow-hidden shadow-sm">
               <CardHeader className="bg-gray-100 p-4">
                 <CardTitle className="text-base font-semibold flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-green-600" />
                   Original Loan Details
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-1">
                  <InfoRow label="Loan Amount" value={formatCurrency(data.loan?.amount)} />
                  <InfoRow label="Start Date" value={formatDate(data.loan?.date)} />
                  <InfoRow label="Due Date" value={formatDate(data.loan?.duedate)} />
                  <InfoRow label="Interest Rate" value={`${data.loan?.interest_rate || '-'}%`} />
                  <InfoRow label="Processing Fee" value={formatCurrency(data.loan?.processing_fee)} />
                  <InfoRow label="Interest Pre-paid" value={data.loan?.interest_taken ? 'Yes' : 'No'} />
              </CardContent>
            </Card>

            {/* Jewel Details Card */}
            <Card className="overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-100 p-4">
                 <CardTitle className="text-base font-semibold flex items-center gap-2">
                   <Gem className="w-5 h-5 text-yellow-500" />
                   Jewel Details
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 {data.jewels.length > 0 ? (
                    <div className="space-y-4">
                      {data.jewels.map((jewel) => (
                        <div key={jewel.id} className="p-3 border rounded-lg bg-white">
                           <h4 className="font-semibold text-gray-800 mb-2">{jewel.type}</h4>
                           <div className="space-y-1">
                             <InfoRow label="Quality" value={jewel.quality} />
                             <InfoRow label="Pieces" value={jewel.pieces} />
                             <InfoRow label="Gross Wt." value={formatWeight(jewel.weight)} />
                             <InfoRow label="Stone Wt." value={formatWeight(jewel.stone_weight)} />
                             <InfoRow label="Net Wt." value={formatWeight(jewel.net_weight)} />
                             {jewel.faults && <InfoRow label="Fault" value={jewel.faults} />}
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No jewel details found.</p>
                  )}
              </CardContent>
            </Card>

            <Button
            onClick={handleDelete}
            variant="outline"
            className="flex-1 h-12 rounded-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors gap-2"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          </main>
        )}
      </div>

      {/* Sticky Footer for Actions */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-[393px] lg:max-w-2xl mx-auto p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="flex justify-between gap-3">
          
          <Button
            onClick={() => navigate(`/edit-repledge/${loanId}`)}
            className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-full transition-colors gap-2"
            disabled={loading}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>

          <Button 
            onClick={() => navigate(`/close-repledge/${loanId}`)}
            variant="outline"
            className="flex-1 h-12 border-black text-black hover:bg-gray-50 font-header-heading-semibold-heading-5-semibold rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>

          {/* <Button 
            onClick={handleDelete}
            variant="destructive"
            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-header-heading-semibold-heading-5-semibold rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button> */}
        </div>
      </footer>
    </>
  );
};
