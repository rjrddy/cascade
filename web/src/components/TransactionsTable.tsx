"use client";
import { api } from '@/lib/api';

export default function TransactionsTable({ transactions, onChange }: { transactions: any[]; onChange: () => void }) {
  async function del(id: string) {
    await api.del(`/transactions/${id}`);
    onChange();
  }

  return (
    <div className="bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Merchant</th>
            <th className="text-right p-2">Amount</th>
            <th className="text-left p-2">Category</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
              <td className="p-2">{t.merchant || t.description || '-'}</td>
              <td className={`p-2 text-right ${t.isIncome ? 'text-green-600' : 'text-red-600'}`}>{t.isIncome ? '+' : '-'}${Number(t.amount).toFixed(2)}</td>
              <td className="p-2">{t.category?.name || '-'}</td>
              <td className="p-2 text-center">
                <button onClick={() => del(t.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
