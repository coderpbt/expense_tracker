"use client";
import { useEffect, useState } from 'react';
import { useToast } from '../components/ToastProvider';
import { createCategory } from '@/lib/actions';

export default function CategoriesPage(){
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(()=>{ fetchItems(); }, []);

  async function fetchItems(){
    const res = await fetch('/api/categories');
    const data = await res.json();
    setItems(data.items||[]);
  }

  async function create(e){
    e.preventDefault();
    try {
      await createCategory(name, userId || undefined);
      toast.addToast('Category created','info');
      setName('');
      setUserId('');
      setShowModal(false);
      fetchItems();
    } catch(err) {
      toast.addToast(err.message || 'Error','error');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded">+ New Category</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Category</h2>
            <form onSubmit={create}>
              <input placeholder="Category Name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <input placeholder="UserId (optional)" value={userId} onChange={(e)=>setUserId(e.target.value)} className="w-full p-2 mb-4 border rounded" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded">
        <ul className="space-y-2">
          {items.map(c=> <li key={c._id} className="py-2 px-3 border rounded">{c.name}</li>)}
        </ul>
        {items.length === 0 && <p className="text-gray-500 text-center py-4">No categories yet</p>}
      </div>
    </div>
  );
}
