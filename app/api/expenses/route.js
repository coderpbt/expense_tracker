import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Expense, Category, User, AuditLog } from '@/db/schema/models';

export async function GET(req) {
  await dbConnect();
  const url = new URL(req.url);
  const user = url.searchParams.get('user');
  const category = url.searchParams.get('category');

  const filter = {};
  if (user) {
    const u = await User.findOne({ username: user }).lean();
    if (u) filter.userId = u._id;
  }
  if (category) {
    const c = await Category.findOne({ name: category }).lean();
    if (c) filter.categoryId = c._id;
  }

  const items = await Expense.find(filter).sort({ date: -1 }).populate('userId', 'username').populate('categoryId', 'name').lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  await dbConnect();
  const { userId, categoryId, amount, description, date } = await req.json();
  if (!userId || !categoryId || !amount || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const doc = await Expense.create({ userId, categoryId, amount: Number(amount), description: description || '', date: new Date(date) });

  try {
    await AuditLog.create({ action: 'create', model: 'Expense', documentId: doc._id, userId });
  } catch (e) { console.error('audit error', e); }
  const plain = JSON.parse(JSON.stringify(doc));
  return NextResponse.json({ ok: true, expense: plain });
}
