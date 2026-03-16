"use client";
import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import Filters from '../components/Filters';
import { createLoan, deleteLoan, getUsers } from '@/lib/actions';

export default function LoansPage(){
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('taken');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(()=>{ 
    fetchItems();
    loadUsers();
  }, []);

  async function loadUsers(){
    const u = await getUsers();
    setUsers(u);
  }

  async function fetchItems(filters){
    const res = await fetch('/api/loans');
    const data = await res.json();
    setItems(data.items||[]);
  }

  async function create(e){
    e.preventDefault();
    try {
      await createLoan(userId, amount, type, date, '');
      toast.addToast('Loan recorded','info');
      setAmount('');
      setDate(new Date().toISOString().slice(0,10));
      setUserId('');
      setShowModal(false);
      fetchItems();
    } catch(err) {
      toast.addToast(err.message || 'Error','error');
    }
  }

  async function del(id){ 
    if (!confirm('Are you sure?')) return;
    try {
      await deleteLoan(id);
      toast.addToast('Deleted','info');
      fetchItems();
    } catch(err) {
      toast.addToast(err.message || 'Error','error');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-16 lg:mt-0">
        <h1 className="text-2xl font-bold">Loans</h1>
        <button onClick={() => { setShowModal(true); setAmount(''); setDate(new Date().toISOString().slice(0,10)); setUserId(''); setType('taken'); }} className="px-4 py-2 bg-blue-600 text-white rounded">+ New Loan</button>
      </div>
      <Filters onApply={()=>{}} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Loan</h2>
            <form onSubmit={create}>
              <select value={userId} onChange={(e)=>setUserId(e.target.value)} className="w-full p-2 mb-3 border rounded" required>
                <option value="">Select User</option>
                {users.map(u=><option key={u._id} value={u._id}>{u.username}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full p-2 mb-3 border rounded">
                <option value="taken">Loan Taken</option>
                <option value="repaid">Loan Repaid</option>
              </select>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full p-2 mb-4 border rounded" required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="p-2">User</th><th className="p-2">Type</th><th className="p-2">Amount</th><th className="p-2">Date</th><th className="p-2">Actions</th></tr></thead>
          <tbody>{items.map(i=> <tr key={i._id} className="border-t"><td className="p-2">{i.userId?.username}</td><td className="p-2"><span className={i.type === 'taken' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{i.type === 'taken' ? 'Taken' : 'Repaid'}</span></td><td className="p-2">{i.amount}</td><td className="p-2">{new Date(i.date).toLocaleDateString()}</td><td className="p-2"><button onClick={()=>del(i._id)} className="text-red-600 text-sm">Delete</button></td></tr>)}</tbody>
        </table>
        {items.length === 0 && <p className="text-center py-4 text-gray-500">No loans yet</p>}
      </div>
    </div>
  );
}
