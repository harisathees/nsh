import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import {
  Settings as SettingsIcon,
  Database,
  Users,
  Shield,
  Bell,
  Coins,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

export function Settings() {
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase.from('metal_rates').select('*');
      const gold = data?.find((r) => r.metal_type === 'Gold');
      const silver = data?.find((r) => r.metal_type === 'Silver');
      setGoldRate(gold?.rate || '');
      setSilverRate(silver?.rate || '');
      setLoading(false);
    };
    fetchRates();
  }, []);

  const updateRate = async (metal: 'Gold' | 'Silver', rate: string) => {
    await supabase
      .from('metal_rates')
      .update({ rate: parseFloat(rate), updated_at: new Date() })
      .eq('metal_type', metal);
    alert(`${metal} rate updated!`);
  };

  const settingsSections = [
    {
      title: 'Metal Rate Settings',
      description: 'Update daily Gold and Silver rates',
      icon: <Coins className="w-8 h-8 text-amber-500" />,
    },
    {
      title: 'General Settings',
      description: 'Basic application configuration',
      icon: <SettingsIcon className="w-8 h-8 text-gray-500" />,
    },
    {
      title: 'User Management',
      description: 'Manage user roles and permissions',
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      title: 'Database Settings',
      description: 'Configure database connections and backups',
      icon: <Database className="w-8 h-8 text-green-500" />,
    },
    {
      title: 'Security Settings',
      description: 'Authentication and security configurations',
      icon: <Shield className="w-8 h-8 text-red-500" />,
    },
    {
      title: 'Notifications',
      description: 'Configure alerts and notification preferences',
      icon: <Bell className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <nav className="flex items-center space-x-1 text-sm text-gray-500">
        <span>Master Settings</span>
      </nav>

      <div className="flex items-center space-x-2 mb-6">
        <SettingsIcon className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-semibold text-gray-800">Master Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => (
          <Card
            key={index}
            className="border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div>{section.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{section.description}</p>
                </div>
              </div>

              {section.title === 'Metal Rate Settings' && (
                <>
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading rates...</p>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Gold Rate (₹ per gram)
                        </label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            value={goldRate}
                            onChange={(e) => setGoldRate(e.target.value)}
                          />
                          <Button onClick={() => updateRate('Gold', goldRate)}>Update</Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Silver Rate (₹ per gram)
                        </label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            value={silverRate}
                            onChange={(e) => setSilverRate(e.target.value)}
                          />
                          <Button onClick={() => updateRate('Silver', silverRate)}>Update</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
