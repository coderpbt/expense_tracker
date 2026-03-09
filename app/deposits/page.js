"use client";
import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { createDeposit, updateDeposit, deleteDeposit, getUsers } from '@/lib/actions';

export default function DepositsPage() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [userId, setUserId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(() => { 
    fetchItems();
    loadUsers();
  }, []);

  async function loadUsers(){
    const u = await getUsers();
    setUsers(u);
  }

  async function fetchItems() {
    const res = await fetch('/api/deposits');
    const data = await res.json();
    setItems(data.items || []);
  }

  async function createOrUpdate(e) {
    e.preventDefault();
    try {
      if (editing){
        await updateDeposit(editing, { amount, note, date });
        toast.addToast('Deposit updated', 'info');
        setEditing(null);
      } else {
        await createDeposit(userId, amount, note, date);
        toast.addToast('Deposit added', 'info');
      }
      setAmount(''); setNote(''); setUserId(''); setDate(new Date().toISOString().slice(0, 10));
      setShowModal(false);
      fetchItems();
    } catch(err) {
      toast.addToast(err.message || 'Error', 'error');
    }
  }

  async function editItem(id){
    const item = items.find(i=>i._id===id);
    if (!item) return;
    setEditing(id);
    setAmount(item.amount);
    setNote(item.note);
    setUserId(item.userId?._id || '');
    setDate(new Date(item.date).toISOString().slice(0,10));
    setShowModal(true);
  }

  async function deleteItem(id){
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDeposit(id);
      toast.addToast('Deleted', 'info');
      fetchItems();
    } catch(err) {
      toast.addToast(err.message || 'Delete failed', 'error');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Deposits</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); setAmount(''); setNote(''); setUserId(''); setDate(new Date().toISOString().slice(0,10)); }} className="px-4 py-2 bg-blue-600 text-white rounded">+ New Deposit</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Deposit' : 'New Deposit'}</h2>
            <form onSubmit={createOrUpdate}>
              <select value={userId} onChange={(e)=>setUserId(e.target.value)} className="w-full p-2 mb-3 border rounded" required>
                <option value="">Select User</option>
                {users.map(u=><option key={u._id} value={u._id}>{u.username}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <textarea placeholder="Note (optional)" value={note} onChange={(e)=>setNote(e.target.value)} className="w-full p-2 mb-4 border rounded"></textarea>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">{editing? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b"><th className="p-2">User</th><th className="p-2">Amount</th><th className="p-2">Note</th><th className="p-2">Date</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {items.map(i=> (
              <tr key={i._id} className="border-t"><td className="p-2">{i.userId?.username}</td><td className="p-2">{i.amount}</td><td className="p-2">{i.note}</td><td className="p-2">{new Date(i.date).toLocaleDateString()}</td><td className="p-2"><button onClick={()=>editItem(i._id)} className="mr-2 text-blue-600 text-sm">Edit</button><button onClick={()=>deleteItem(i._id)} className="text-red-600 text-sm">Delete</button></td></tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center py-4 text-gray-500">No deposits yet</p>}
      </div>
    </div>
  );
}
