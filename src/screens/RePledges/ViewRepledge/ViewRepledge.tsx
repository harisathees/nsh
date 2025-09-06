import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, User, Landmark, ShieldCheck, Gem, Hash, CheckCircle2 } from "lucide-react";

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
        <header className="bg-black rounded-b-[50px] h-[53px] flex items-center justify-between px-6  top-0 z-10">
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
          <main className="px-1 py-6 space-y-6 pb-32">
            {/* Customer Hero Section */}
            <section className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50">
              {/* Customer Photo */}
              <CustomerPhoto
                photoUrl={data.customer?.photo_url ?? undefined}
                customerName={data.customer?.name ?? undefined}
                className="w-16 h-16 flex-shrink-0"
              />

              {/* Info Stack */}
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-gray-900">{data.customer?.name}</h2>
                <div className="mt-1 inline-flex items-center">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 flex items-center">
                    <Hash className="w-3 h-3 mr-1 text-gray-500" />
                    {data.loan?.loan_no}
                  </span>
                </div>
              </div>
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
        <div className="flex items-stretch space-x-3 p-1.5 rounded-full bg-gray-100 border border-gray-200">
          {/* Edit Button */}
          <Button
            onClick={() => navigate(`/edit-repledge/${loanId}`)}
            className="flex-1 h-12 bg-white hover:bg-gray-50 text-black font-semibold rounded-full shadow-sm gap-2"
            disabled={loading}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>

          {/* Close Button */}
          <Button
            onClick={() => navigate(`/close-repledge/${loanId}`)}
            className="flex-1 h-12 bg-green-500 hover:bg-green-900 text-white font-semibold rounded-full gap-2"
            disabled={loading}
          >
            <CheckCircle2 className="w-4 h-4" />
            Close
          </Button>
        </div>
      </footer>
    </>
  );
};
