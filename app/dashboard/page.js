import React from 'react';
import { getSummary } from '@/lib/actions';

export default async function DashboardPage() {
  const data = await getSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="text-sm text-gray-500">Total Deposit</div>
          <div className="text-2xl font-semibold">{data?.totalDeposit ?? 0}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="text-sm text-gray-500">Total Expense</div>
          <div className="text-2xl font-semibold">{data?.totalExpense ?? 0}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div className="text-sm text-gray-500">Remaining Balance</div>
          <div className="text-2xl font-semibold">{data?.remainingBalance ?? 0}</div>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">User-wise Deposit</h2>
        <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">{JSON.stringify(data?.userDepositMap || {}, null, 2)}</pre>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">User-wise Expense</h2>
        <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">{JSON.stringify(data?.userExpenseMap || {}, null, 2)}</pre>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Category-wise Expense</h2>
        <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">{JSON.stringify(data?.categoryMap || {}, null, 2)}</pre>
      </section>
    </div>
  );
}
