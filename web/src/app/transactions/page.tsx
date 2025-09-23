"use client";
import Navbar from '@/components/Navbar';
import TransactionsTable from '@/components/TransactionsTable';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [form, setForm] = useState({ date: '', amount: '', merchant: '', description: '', isIncome: false });

  async function refresh() {
    const res = await api.get('/transactions');
    setTransactions(res.transactions || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/transactions/manual', { ...form, amount: Number(form.amount) });
    setForm({ date: '', amount: '', merchant: '', description: '', isIncome: false });
    refresh();
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Add Transaction</h2>
          <form className="grid grid-cols-1 md:grid-cols-6 gap-2" onSubmit={addManual}>
            <input className="border rounded p-2" placeholder="Date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="border rounded p-2" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className="border rounded p-2" placeholder="Merchant" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
            <input className="border rounded p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isIncome} onChange={(e) => setForm({ ...form, isIncome: e.target.checked })} /> Income</label>
            <button className="bg-black text-white rounded p-2">Add</button>
          </form>
        </div>
        <TransactionsTable transactions={transactions} onChange={refresh} />
      </div>
    </div>
  );
}
