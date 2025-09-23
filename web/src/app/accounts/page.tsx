"use client";
import Navbar from '@/components/Navbar';
import PlaidLinkButton from '@/components/PlaidLinkButton';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/accounts').then((res) => setAccounts(res.accounts || []));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Accounts</h1>
          <PlaidLinkButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="bg-white rounded shadow p-4">
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-gray-600">{a.type}{a.subtype ? ` · ${a.subtype}` : ''}</div>
              <div className="mt-2 text-lg">${a.currentBalance?.toFixed?.(2) ?? a.currentBalance}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
