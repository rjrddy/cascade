"use client";
import Navbar from '@/components/Navbar';
import SankeyChart from '@/components/SankeyChart';
import BudgetProgressCard from '@/components/BudgetProgressCard';
import NetBalanceCard from '@/components/NetBalanceCard';

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NetBalanceCard />
          <BudgetProgressCard />
          <div className="bg-white rounded shadow p-4">Upcoming bills</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3">Spending Flows</h2>
          <SankeyChart />
        </div>
      </div>
    </div>
  );
}
