"use client";
import { useEffect, useState } from 'react';

export default function AuditPage(){
  const [items, setItems] = useState([]);

  useEffect(()=>{ fetchAuditLogs(); }, []);

  async function fetchAuditLogs(){
    const res = await fetch('/api/audit');
    const data = await res.json();
    setItems(data.items||[]);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Activity Log</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b"><th>Timestamp</th><th>User</th><th>Action</th><th>Model</th><th>Doc ID</th><th>Changes</th></tr>
          </thead>
          <tbody>
            {items.map(a=> (
              <tr key={a._id} className="border-b py-2"><td>{new Date(a.createdAt).toLocaleString()}</td><td>{a.username||'N/A'}</td><td className="font-semibold">{a.action}</td><td>{a.model}</td><td className="text-xs">{String(a.documentId).slice(0,8)}</td><td className="text-xs">{JSON.stringify(a.changes).slice(0,50)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
