'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { Shield, Bell, Key, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useUserStore } from '@/stores/user-store';
import { type SupportedCurrency } from '@/types';

export default function SettingsPage() {
  const { preferences, updatePreferences } = useUserStore();

  const currencyOptions = [
    { value: 'INR', label: 'INR (₹) - Indian Rupee' },
    { value: 'USD', label: 'USD ($) - US Dollar' },
    { value: 'EUR', label: 'EUR (€) - Euro' },
    { value: 'GBP', label: 'GBP (£) - British Pound' },
  ];

  const handleCurrencyChange = (val: string) => {
    updatePreferences({ currency: val as SupportedCurrency });
    toast.success(`Currency changed to ${val}`);
  };

  const togglePreference = (key: 'notifications' | 'biometricAuth') => {
    const newVal = !preferences[key];
    updatePreferences({ [key]: newVal });
    toast.success(`${key === 'notifications' ? 'Notifications' : 'Biometric Auth'} ${newVal ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none animate-fade-in text-slate-800">
      {/* Platform Currency settings */}
      <Card className="p-6 flex flex-col gap-4 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Platform Currency</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 select-none">Change default fiat evaluation values</p>
          </div>
        </div>

        <div className="max-w-md mt-1">
          <Select
            label="Display Currency"
            options={currencyOptions}
            value={preferences.currency}
            onChange={handleCurrencyChange}
          />
        </div>
      </Card>

      {/* Notifications settings */}
      <Card className="p-6 flex flex-col gap-4 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Notification Alerts</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 select-none">Settle notification trigger rules</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-800">Push System Alerts</span>
            <span className="text-[10px] text-slate-500 select-none">Receive notifications on deposits and bills paid</span>
          </div>
          <button
            onClick={() => togglePreference('notifications')}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              preferences.notifications ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                preferences.notifications ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Security settings */}
      <Card className="p-6 flex flex-col gap-4 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">On-Chain Shield</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 select-none">Settle biometric validation preferences</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-800">Require Biometric PIN</span>
            <span className="text-[10px] text-slate-500 select-none">Prompts fingerprint check upon confirming transaction</span>
          </div>
          <button
            onClick={() => togglePreference('biometricAuth')}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              preferences.biometricAuth ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                preferences.biometricAuth ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}
