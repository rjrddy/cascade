"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function NetBalanceCard() {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, net: 0 });

  useEffect(() => {
    (async () => {
      const res = await api.get('/transactions');
      const txs = res.transactions || [];
      const income = txs.filter((t: any) => t.isIncome).reduce((s: number, t: any) => s + Number(t.amount), 0);
      const expenses = txs.filter((t: any) => !t.isIncome && !t.isTransfer).reduce((s: number, t: any) => s + Number(t.amount), 0);
      setSummary({ income, expenses, net: income - expenses });
    })();
  }, []);

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-600">Net Balance</div>
      <div className="text-2xl font-semibold mt-1">${summary.net.toFixed(2)}</div>
      <div className="text-xs text-gray-600 mt-2">Income ${summary.income.toFixed(2)} · Expenses ${summary.expenses.toFixed(2)}</div>
    </div>
  );
}
