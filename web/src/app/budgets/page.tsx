"use client";
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [monthYear, setMonthYear] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [form, setForm] = useState({ categoryId: '', amount: '' });
  const [categories, setCategories] = useState<any[]>([]);

  async function refresh() {
    const [b, c] = await Promise.all([api.get(`/budgets?month=${monthYear.month}&year=${monthYear.year}`), api.get('/categories')]);
    setBudgets(b.budgets || []);
    setCategories(c.categories || []);
  }

  useEffect(() => {
    refresh();
  }, [monthYear.month, monthYear.year]);

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/budgets', { month: monthYear.month, year: monthYear.year, categoryId: form.categoryId, amount: Number(form.amount) });
    setForm({ categoryId: '', amount: '' });
    refresh();
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Set Budget</h2>
          <form className="grid grid-cols-1 md:grid-cols-5 gap-2" onSubmit={saveBudget}>
            <select className="border rounded p-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input className="border rounded p-2" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className="border rounded p-2" placeholder="Month" value={monthYear.month} onChange={(e) => setMonthYear({ ...monthYear, month: Number(e.target.value) })} />
            <input className="border rounded p-2" placeholder="Year" value={monthYear.year} onChange={(e) => setMonthYear({ ...monthYear, year: Number(e.target.value) })} />
            <button className="bg-black text-white rounded p-2">Save</button>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => (
            <div key={b.id} className="bg-white rounded shadow p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{b.category}</div>
                <div className="text-sm text-gray-600">${b.spent.toFixed(2)} / ${b.amount.toFixed(2)}</div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded">
                <div className={`h-2 rounded ${b.percent < 70 ? 'bg-green-500' : b.percent < 90 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, b.percent)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
