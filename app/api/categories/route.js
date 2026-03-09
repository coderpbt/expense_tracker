import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { Category, AuditLog } from '@/db/schema/models';

export async function GET() {
  await dbConnect();
  const items = await Category.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req) {
  await dbConnect();
  const { name, userId } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const exists = await Category.findOne({ name }).lean();
  if (exists) return NextResponse.json({ error: 'Category exists' }, { status: 409 });

  const cat = await Category.create({ name });
  try {
    if (userId) await AuditLog.create({ action: 'create', model: 'Category', documentId: cat._id, userId });
  } catch (e) { console.error('audit error', e); }
  const plain = JSON.parse(JSON.stringify(cat));
  return NextResponse.json({ ok: true, category: plain });
}
