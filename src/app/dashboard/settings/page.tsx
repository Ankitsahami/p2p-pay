'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { Shield, Bell, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { type SupportedCurrency } from '@/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { preferences, updatePreferences } = useUserStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

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
    <div className={cn("max-w-2xl mx-auto flex flex-col gap-6 select-none animate-fade-in transition-colors duration-300", isDark ? "text-white" : "text-slate-800")}>
      {/* Platform Currency settings */}
      <Card className="p-6 flex flex-col gap-4">
        <div className={cn("flex items-center gap-3 pb-3 border-b", isDark ? "border-white/5" : "border-slate-100")}>
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
          )}>
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>Platform Currency</h3>
            <p className={cn("text-[10px] mt-0.5 select-none", isDark ? "text-white/50" : "text-slate-500")}>Change default fiat evaluation values</p>
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
      <Card className="p-6 flex flex-col gap-4">
        <div className={cn("flex items-center gap-3 pb-3 border-b", isDark ? "border-white/5" : "border-slate-100")}>
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
          )}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>Notification Alerts</h3>
            <p className={cn("text-[10px] mt-0.5 select-none", isDark ? "text-white/50" : "text-slate-500")}>Settle notification trigger rules</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>Push System Alerts</span>
            <span className={cn("text-[10px] select-none", isDark ? "text-white/40" : "text-slate-500")}>Receive notifications on deposits and bills paid</span>
          </div>
          <button
            onClick={() => togglePreference('notifications')}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
              preferences.notifications
                ? "bg-blue-600"
                : isDark ? "bg-white/10" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                preferences.notifications ? "left-6" : "left-1"
              )}
            />
          </button>
        </div>
      </Card>

      {/* Security settings */}
      <Card className="p-6 flex flex-col gap-4">
        <div className={cn("flex items-center gap-3 pb-3 border-b", isDark ? "border-white/5" : "border-slate-100")}>
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
          )}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>On-Chain Shield</h3>
            <p className={cn("text-[10px] mt-0.5 select-none", isDark ? "text-white/50" : "text-slate-500")}>Settle biometric validation preferences</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>Require Biometric PIN</span>
            <span className={cn("text-[10px] select-none", isDark ? "text-white/40" : "text-slate-500")}>Prompts fingerprint check upon confirming transaction</span>
          </div>
          <button
            onClick={() => togglePreference('biometricAuth')}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
              preferences.biometricAuth
                ? "bg-blue-600"
                : isDark ? "bg-white/10" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                preferences.biometricAuth ? "left-6" : "left-1"
              )}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}
