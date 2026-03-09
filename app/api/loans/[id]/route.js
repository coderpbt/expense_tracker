import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Loan, AuditLog } from '@/db/schema/models';

export async function PATCH(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const { amount, type, date, note } = body;

  const existing = await Loan.findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (amount !== undefined) existing.amount = amount;
  if (type) existing.type = type;
  if (date) existing.date = new Date(date);
  if (note !== undefined) existing.note = note;

  await existing.save();
  try { await AuditLog.create({ action: 'update', model: 'Loan', documentId: existing._id, changes: { amount: existing.amount, type: existing.type } }); } catch(e){ console.error('audit error', e); }
  const plain = JSON.parse(JSON.stringify(existing));
  return NextResponse.json({ ok: true, loan: plain });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  await Loan.findByIdAndDelete(params.id);
  try { await AuditLog.create({ action: 'delete', model: 'Loan', documentId: params.id }); } catch(e){ console.error('audit error', e); }
  return NextResponse.json({ ok: true });
}
