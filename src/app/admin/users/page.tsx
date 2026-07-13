'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MOCK_ADMIN_USERS } from '@/lib/mock-data';
import { formatCurrency, truncateAddress } from '@/lib/utils';
import { Search, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState('');
  const [users, setUsers] = React.useState(MOCK_ADMIN_USERS);

  const filteredUsers = React.useMemo(() => {
    if (!search.trim()) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.walletAddress.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    toast.success(`User status changed to ${nextStatus}`);
  };

  const getKycVariant = (kyc: string) => {
    if (kyc === 'verified') return 'success';
    if (kyc === 'pending') return 'warning';
    if (kyc === 'rejected') return 'error';
    return 'neutral';
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none animate-fade-in text-slate-800">
      {/* Search Filter Header */}
      <div className="max-w-md">
        <Input
          placeholder="Search users by name, email or wallet address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-500" />}
        />
      </div>

      {/* Users table */}
      <Card className="overflow-hidden bg-white border border-slate-100 shadow-sm" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 select-none">
                <th className="p-4 font-bold">User info</th>
                <th className="p-4 font-bold">Wallet Address</th>
                <th className="p-4 font-bold">KYC status</th>
                <th className="p-4 font-bold">Dues paid</th>
                <th className="p-4 font-bold">Total Dues</th>
                <th className="p-4 font-bold">State</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold select-none">
                    No users matching search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs">
                          {u.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{u.name}</span>
                          <span className="text-[10px] text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {truncateAddress(u.walletAddress, 8, 6)}
                    </td>
                    <td className="p-4">
                      <Badge variant={getKycVariant(u.kycStatus)} size="sm">
                        {u.kycStatus === 'none' ? 'not submitted' : u.kycStatus}
                      </Badge>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{u.transactionCount} operations</td>
                    <td className="p-4 font-bold text-slate-800">{formatCurrency(u.totalVolume, u.currency)}</td>
                    <td className="p-4">
                      <Badge variant={u.status === 'active' ? 'success' : 'error'} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          u.status === 'suspended'
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50'
                            : 'text-red-600 bg-red-50 border-red-100 hover:bg-red-100/50'
                        }`}
                        title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                      >
                        {u.status === 'suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
