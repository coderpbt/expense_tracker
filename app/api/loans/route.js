import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Loan, AuditLog } from '@/db/schema/models';

export async function GET(req) {
  await dbConnect();
  const items = await Loan.find({}).sort({ date: -1 }).populate('userId', 'username').lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  await dbConnect();
  const { userId, amount, type, date, note } = await req.json();
  if (!amount || !type || !date) return NextResponse.json({ error: 'Missing required' }, { status: 400 });

  const doc = await Loan.create({ userId, amount: Number(amount), type, date: new Date(date), note: note || '' });
  try { if (userId) await AuditLog.create({ action: 'create', model: 'Loan', documentId: doc._id, userId }); } catch(e){ console.error('audit error', e); }
    const plain = JSON.parse(JSON.stringify(doc));
    return NextResponse.json({ ok: true, loan: plain });
}
