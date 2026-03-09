import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Deposit, User, AuditLog } from '@/db/schema/models';

export async function GET(req) {
  await dbConnect();

  // Basic listing with optional user filter
  const url = new URL(req.url);
  const user = url.searchParams.get('user');

  const filter = {};
  if (user) {
    const u = await User.findOne({ username: user }).lean();
    if (u) filter.userId = u._id;
  }

  const items = await Deposit.find(filter).sort({ date: -1 }).populate('userId', 'username').lean();

  return NextResponse.json({ items });
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { userId, amount, note, date } = body;

  if (!userId || !amount || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const doc = await Deposit.create({ userId, amount: Number(amount), note: note || '', date: new Date(date) });

  // Audit log
  try {
    await AuditLog.create({ action: 'create', model: 'Deposit', documentId: doc._id, userId: userId, changes: { amount: doc.amount, note: doc.note } });
  } catch (e) {
    // do not fail on audit error
    console.error('audit error', e);
  }

  const plain = JSON.parse(JSON.stringify(doc));
  return NextResponse.json({ ok: true, deposit: plain });
}
