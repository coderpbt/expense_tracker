"use client";
import { useEffect, useRef, useState } from 'react';
import Filters from '../components/Filters';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ start: null, end: null });

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    let url = '/api/reports/summary';
    if (filters.start || filters.end) {
      const params = new URLSearchParams();
      if (filters.start) params.set('start', filters.start);
      if (filters.end) params.set('end', filters.end);
      url += `?${params.toString()}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setSummary(data);
    return data;
  }

  // no longer using printRef; export creates a temporary container

  function loadHtml2pdf() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('No window'));
      if (window.html2pdf) return resolve(window.html2pdf);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js';
      s.onload = () => resolve(window.html2pdf);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function handleExport() {
    // ensure html2pdf loaded
    try {
      await loadHtml2pdf();
    } catch (e) {
      alert('Failed to load html2pdf.');
      return;
    }
    // refresh summary data before exporting and use latest
    let latest;
    try {
      latest = await fetchSummary();
    } catch (e) {
      console.warn('fetchSummary failed before export', e);
    }

    const data = latest || summary;
    if (!data) {
      alert('No data to export');
      return;
    }

    // Build HTML string for export (inline styles for predictable rendering)
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; padding:24px; color:#111;">
        <h1 style="text-align:center;">Expenses Report</h1>
        <div style="margin-top:12px;">
          <p><strong>Total Deposit:</strong> ${data.totalDeposit}</p>
          <p><strong>Total Expense:</strong> ${data.totalExpense}</p>
          <p><strong>Loans Taken:</strong> ${data.loansTaken}</p>
          <p><strong>Remaining Balance:</strong> ${data.remainingBalance}</p>
        </div>
        <hr />
        <h3>User-wise Deposits</h3>
        <div>
          ${Object.entries(data.userDepositMap || {}).map(([u,a]) => `<div>${u}: ${a}</div>`).join('')}
        </div>
        <h3>User-wise Expenses</h3>
        <div>
          ${Object.entries(data.userExpenseMap || {}).map(([u,a]) => `<div>${u}: ${a}</div>`).join('')}
        </div>
        <h3>Category-wise Expenses</h3>
        <div>
          ${Object.entries(data.categoryMap || {}).map(([c,a]) => `<div>${c}: ${a}</div>`).join('')}
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.background = '#ffffff';
    container.style.color = '#000000';
    container.style.padding = '16px';
    container.style.zIndex = '9999';
    container.innerHTML = html;
    document.body.appendChild(container);

    // small delay to ensure browser paints the container
    await new Promise((res) => setTimeout(res, 250));
    console.log('Export container innerHTML:', container.innerHTML.substring(0, 300));

    const opt = {
      margin:       10,
      filename:     'expenses-report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // generate PDF and remove container afterwards
    try {
      await window.html2pdf().set(opt).from(container).save();
    } catch (e) {
      console.error('html2pdf error', e);
      alert('PDF generation failed');
    } finally {
      container.remove();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <Filters onApply={(f) => { setFilters(f); }} />

      {summary && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Deposit</div>
              <div className="text-3xl font-bold">{summary.totalDeposit}</div>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Expense</div>
              <div className="text-3xl font-bold">{summary.totalExpense}</div>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-300">Loans Taken</div>
              <div className="text-3xl font-bold">{summary.loansTaken}</div>
            </div>
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-300">Remaining Balance</div>
              <div className="text-3xl font-bold font-semibold">{summary.remainingBalance}</div>
            </div>
          </div>

          <div className="mb-6 flex gap-2">
            <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded">Download PDF</button>
          </div>

          {/* Printable snapshot now created dynamically in handleExport */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded">
              <h2 className="text-lg font-semibold mb-3">User-wise Deposits</h2>
              <div className="space-y-2">
                {Object.entries(summary.userDepositMap || {}).map(([user, amount]) => (
                  <div key={user} className="flex justify-between p-2 border-b">
                    <span>{user}</span>
                    <span className="font-semibold">{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded">
              <h2 className="text-lg font-semibold mb-3">User-wise Expenses</h2>
              <div className="space-y-2">
                {Object.entries(summary.userExpenseMap || {}).map(([user, amount]) => (
                  <div key={user} className="flex justify-between p-2 border-b">
                    <span>{user}</span>
                    <span className="font-semibold">{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded md:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Category-wise Expenses</h2>
              <div className="space-y-2">
                {Object.entries(summary.categoryMap || {}).map(([category, amount]) => (
                  <div key={category} className="flex justify-between p-2 border-b">
                    <span>{category}</span>
                    <span className="font-semibold">{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
