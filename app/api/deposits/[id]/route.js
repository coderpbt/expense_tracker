import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Deposit, User, AuditLog } from '@/db/schema/models';

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
  if (!user || user.username !== 'arafat') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { amount, note, date } = body;

  const updated = await Deposit.findByIdAndUpdate(
    params.id,
    { ...(amount !== undefined ? { amount } : {}), ...(note !== undefined ? { note } : {}), ...(date ? { date: new Date(date) } : {}) },
    { new: true }
  );

  try {
    await AuditLog.create({ action: 'update', model: 'Deposit', documentId: updated._id, userId: user.id, changes: { amount: updated.amount, note: updated.note } });
  } catch (e) {
    console.error('audit error', e);
  }
  const plain = JSON.parse(JSON.stringify(updated));
  return NextResponse.json({ ok: true, updated: plain });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const user = getRequestUser(req);
  if (!user || user.username !== 'arafat') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Deposit.findByIdAndDelete(params.id);
  try {
    await AuditLog.create({ action: 'delete', model: 'Deposit', documentId: params.id, userId: user.id });
  } catch (e) {
    console.error('audit error', e);
  }
  return NextResponse.json({ ok: true });
}
