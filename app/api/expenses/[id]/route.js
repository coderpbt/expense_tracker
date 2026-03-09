import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Expense, AuditLog } from '@/db/schema/models';

function getRequestUser(req) {
  const cookie = req.cookies.get('expense_user')?.value;
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch (e) {
    return null;
  }
}

export async function PATCH(req, { params }) {
  await dbConnect();
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { amount, description, date, categoryId } = body;

  const existing = await Expense.findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only creator or admin (arafat) can edit
  if (String(existing.userId) !== user.id && user.username !== 'arafat') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (amount !== undefined) existing.amount = amount;
  if (description !== undefined) existing.description = description;
  if (date) existing.date = new Date(date);
  if (categoryId) existing.categoryId = categoryId;

  await existing.save();
  try { await AuditLog.create({ action: 'update', model: 'Expense', documentId: existing._id, userId: user.id, changes: { amount: existing.amount, description: existing.description } }); } catch(e){ console.error('audit error', e); }
  const plain = JSON.parse(JSON.stringify(existing));
  return NextResponse.json({ ok: true, expense: plain });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await Expense.findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (String(existing.userId) !== user.id && user.username !== 'arafat') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Expense.findByIdAndDelete(params.id);
  try { await AuditLog.create({ action: 'delete', model: 'Expense', documentId: params.id, userId: user.id }); } catch(e){ console.error('audit error', e); }
  return NextResponse.json({ ok: true });
}
