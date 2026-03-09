"use client";
import { useState, useEffect } from 'react';

export default function Filters({ onApply }) {
  const [range, setRange] = useState('this_month');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [category, setCategory] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    if (range !== 'custom') handleQuickRange(range);
  }, [range]);

  function handleQuickRange(r) {
    const now = new Date();
    let s, e;
    e = now.toISOString().slice(0, 10);
    if (r === 'today') s = e;
    else if (r === 'this_week') {
      const first = new Date(now.setDate(now.getDate() - now.getDay()));
      s = first.toISOString().slice(0, 10);
    } else if (r === 'this_month') s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    else if (r === 'this_year') s = new Date(now.getFullYear(),0,1).toISOString().slice(0,10);
    setStart(s); setEnd(e);
  }

  function apply() {
    onApply({ start: start || null, end: end || null, category: category || null, user: user || null });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded mb-4">
      <div className="flex gap-2 items-end">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="p-2 border rounded">
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
          <option value="custom">Custom</option>
        </select>
        <input type="date" value={start} onChange={(e)=>setStart(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={end} onChange={(e)=>setEnd(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} className="p-2 border rounded" />
        <input placeholder="User" value={user} onChange={(e)=>setUser(e.target.value)} className="p-2 border rounded" />
        <button onClick={apply} className="px-3 py-2 bg-blue-600 text-white rounded">Apply</button>
      </div>
    </div>
  );
}
