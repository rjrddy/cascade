"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function BudgetProgressCard() {
  const [budgets, setBudgets] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get('/budgets');
      setBudgets((res.budgets || []).slice(0, 3));
    })();
  }, []);

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="font-medium mb-2">Budgets</div>
      <div className="space-y-2">
        {budgets.map((b) => (
          <div key={b.categoryId}>
            <div className="flex items-center justify-between text-sm">
              <span>{b.category}</span>
              <span>${b.spent.toFixed(0)} / ${b.amount.toFixed(0)}</span>
            </div>
            <div className="mt-1 h-2 bg-gray-200 rounded">
              <div className={`h-2 rounded ${b.percent < 70 ? 'bg-green-500' : b.percent < 90 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, b.percent)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
