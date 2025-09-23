"use client";
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

export default function SankeyChart() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get('/transactions');
      setTransactions(res.transactions || []);
    })();
  }, []);

  const { nodes, links } = useMemo(() => {
    const nodes: { name: string }[] = [];
    const nodeIndex = new Map<string, number>();
    function idx(name: string) {
      if (!nodeIndex.has(name)) {
        nodeIndex.set(name, nodes.length);
        nodes.push({ name });
      }
      return nodeIndex.get(name)!;
    }

    const links: { source: number; target: number; value: number }[] = [];

    // Build flows: Income Source -> Category -> Merchant
    for (const t of transactions) {
      const amount = Number(t.amount);
      if (!Number.isFinite(amount) || amount <= 0) continue;
      if (t.isTransfer) continue;
      if (t.isIncome) {
        const src = idx(t.merchant || 'Income');
        const cat = idx('Income');
        links.push({ source: src, target: cat, value: amount });
      } else {
        const src = idx('Income');
        const cat = idx(t.category?.name || 'Uncategorized');
        const merch = idx(t.merchant || t.description || 'Other');
        links.push({ source: src, target: cat, value: amount });
        links.push({ source: cat, target: merch, value: amount });
      }
    }

    return { nodes, links };
  }, [transactions]);

  const hasData = nodes.length > 1 && links.length > 0;

  if (!hasData) {
    return (
      <div className="text-sm text-gray-500 py-12 text-center">Not enough data to render flows yet.</div>
    );
  }

  return (
    <div style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <Sankey data={{ nodes, links }} node={{ stroke: '#999', strokeWidth: 1 }} link={{ stroke: '#aaa' }}>
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
