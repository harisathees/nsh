import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import {
  Settings as SettingsIcon,
  Database,
  Users,
  Shield,
  Bell,
  Coins,
  Loader2,
  Save,
  CheckCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BankManagement } from '../screens/RePledge/BankManagement';

const settingsSections = [
  { id: 'metal_rates', title: 'Metal Rates', description: 'Update daily Gold and Silver rates.', icon: <Coins className="w-5 h-5" /> },
  { id: 'general', title: 'General', description: 'Basic application configuration.', icon: <SettingsIcon className="w-5 h-5" /> },
  { id: 'user_management', title: 'User Management', description: 'Manage user roles and permissions.', icon: <Users className="w-5 h-5" /> },
  { id: 'bank_management', title: 'Bank Management', description: 'Manage bank details and settings.', icon: <Building2 className="w-5 h-5" /> },
];

// --- Metal Rates Panel Component (MODIFIED) ---
const MetalRatesPanel = () => {
  const [initialRates, setInitialRates] = useState({ gold: '', silver: '' });
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const hasChanges = goldRate !== initialRates.gold || silverRate !== initialRates.silver;

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      const { data } = await supabase.from('metal_rates').select('*');
      const gold = data?.find((r) => r.metal_type === 'Gold')?.rate || '';
      const silver = data?.find((r) => r.metal_type === 'Silver')?.rate || '';
      setGoldRate(gold);
      setSilverRate(silver);
      setInitialRates({ gold, silver });
      setLoading(false);
    };
    fetchRates();
  }, []);
  
  const handleSave = async () => {
    if (!goldRate || !silverRate) {
        setStatusMessage({ type: 'error', text: 'Rates cannot be empty.' });
        return;
    }

    setSaving(true);
    setStatusMessage(null);

    const updates = [
        supabase.from('metal_rates').update({ rate: parseFloat(goldRate), updated_at: new Date() }).eq('metal_type', 'Gold'),
        supabase.from('metal_rates').update({ rate: parseFloat(silverRate), updated_at: new Date() }).eq('metal_type', 'Silver'),
    ];

    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);

    if (hasError) {
        setStatusMessage({ type: 'error', text: 'Error saving rates. Please try again.' });
        console.error(results.find(res => res.error)?.error);
    } else {
        setStatusMessage({ type: 'success', text: 'Rates saved successfully!' });
        setInitialRates({ gold: goldRate, silver: silverRate }); // Update initial state
    }

    setSaving(false);
    setTimeout(() => setStatusMessage(null), 3000); // Hide message after 3 seconds
  };


  if (loading) {
    return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
        <CardHeader>
            <CardTitle>Update Metal Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Gold Rate (₹ per gram)</label>
                <Input
                    type="number"
                    placeholder="e.g., 6500"
                    value={goldRate}
                    onChange={(e) => setGoldRate(e.target.value)}
                    className="bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Silver Rate (₹ per gram)</label>
                <Input
                    type="number"
                    placeholder="e.g., 80"
                    value={silverRate}
                    onChange={(e) => setSilverRate(e.target.value)}
                    className="bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500"
                />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full sm:w-auto">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2"/>}
                    Save Changes
                </Button>
                {statusMessage && (
                    <div className={`flex items-center gap-2 text-sm font-medium ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  )
}

// --- Placeholder Panel Component ---
const PlaceholderPanel = ({ title }: { title: string }) => (
    <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="text-center py-16 text-slate-500">
            <p>Settings for {title} will be available here.</p>
        </CardContent>
    </Card>
);


// --- Main Settings Page Component ---
export function Settings() {
    const [activeSection, setActiveSection] = useState('metal_rates');

    const renderContent = () => {
        switch (activeSection) {
            case 'metal_rates': return <MetalRatesPanel />;
            case 'general': return <PlaceholderPanel title="General Settings" />;
            case 'user_management': return <PlaceholderPanel title="User Management" />;
            case 'bank_management': return <BankManagement title="bank Management" />;
            default: return <MetalRatesPanel />;
        }
    };
    
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
            <p className="text-slate-500 mt-1">Manage your application and account settings.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-1">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeSection === section.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                            )}
                        >
                            {section.icon}
                            <span>{section.title}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="md:col-span-3">
                {renderContent()}
            </main>
        </div>
      </div>
    </div>
  );
}