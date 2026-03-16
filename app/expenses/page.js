"use client";
import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import Filters from '../components/Filters';
import { createExpense, updateExpense, deleteExpense, getUsers, getCategories } from '@/lib/actions';

export default function ExpensesPage(){
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(()=>{ 
    fetchItems();
    loadOptions();
  }, []);

  async function loadOptions(){
    const [u, c] = await Promise.all([getUsers(), getCategories()]);
    setUsers(u);
    setCategories(c);
  }

  async function fetchItems(filters){
    let url = '/api/expenses';
    if (filters){
      const params = new URLSearchParams();
      if (filters.user) params.set('user', filters.user);
      if (filters.category) params.set('category', filters.category);
      url += `?${params.toString()}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setItems(data.items || []);
  }

  async function createOrUpdate(e){
    e.preventDefault();
    try{
      if (editing){
        await updateExpense(editing, { amount, description, date, categoryId });
        toast.addToast('Expense updated','info');
        setEditing(null);
      } else {
        await createExpense(userId, categoryId, amount, description, date);
        toast.addToast('Expense added','info');
      }
      setAmount(''); setDescription(''); setDate(''); setCategoryId(''); setUserId('');
      setShowModal(false);
      fetchItems();
    }catch(err){ toast.addToast(err.message || 'Operation failed','error'); }
  }

  async function editItem(id){
    const item = items.find(i=>i._id===id);
    if (!item) return;
    setEditing(id);
    setAmount(item.amount); 
    setDescription(item.description||''); 
    setDate(new Date(item.date).toISOString().slice(0,10)); 
    setCategoryId(item.categoryId?._id||''); 
    setUserId(item.userId?._id||'');
    setShowModal(true);
  }

  async function deleteItem(id){
    if (!confirm('Are you sure?')) return;
    try {
      await deleteExpense(id);
      toast.addToast('Deleted','info');
      fetchItems();
    } catch(err) {
      toast.addToast(err.message || 'Delete failed','error');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-16 lg:mt-0">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); setAmount(''); setDescription(''); setDate(''); setCategoryId(''); setUserId(''); }} className="px-4 py-2 bg-blue-600 text-white rounded">+ New Expense</button>
      </div>
      <Filters onApply={(f)=>fetchItems(f)} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Expense' : 'New Expense'}</h2>
            <form onSubmit={createOrUpdate}>
              <select value={userId} onChange={(e)=>setUserId(e.target.value)} className="w-full p-2 mb-3 border rounded" required>
                <option value="">Select User</option>
                {users.map(u=><option key={u._id} value={u._id}>{u.username}</option>)}
              </select>
              <select value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} className="w-full p-2 mb-3 border rounded" required>
                <option value="">Select Category</option>
                {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full p-2 mb-4 border rounded"></textarea>
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
            <tr className="text-left border-b"><th className="p-2">User</th><th className="p-2">Category</th><th className="p-2">Amount</th><th className="p-2">Date</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {items.map(i=> (
              <tr key={i._id} className="border-t"><td className="p-2">{i.userId?.username}</td><td className="p-2">{i.categoryId?.name}</td><td className="p-2">{i.amount}</td><td className="p-2">{new Date(i.date).toLocaleDateString()}</td><td className="p-2"><button onClick={()=>editItem(i._id)} className="mr-2 text-blue-600 text-sm">Edit</button><button onClick={()=>deleteItem(i._id)} className="text-red-600 text-sm">Delete</button></td></tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center py-4 text-gray-500">No expenses yet</p>}
      </div>
    </div>
  );
}
