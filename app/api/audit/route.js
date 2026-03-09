import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { AuditLog, User } from '@/db/schema/models';

export async function GET(req) {
  await dbConnect();
  const items = await AuditLog.find({}).sort({ createdAt: -1 }).lean();
  const detailed = [];
  for (const a of items) {
    const u = a.userId ? await User.findById(a.userId).lean() : null;
    detailed.push({ ...a, username: u?.username || null });
  }
  return NextResponse.json({ items: detailed });
}
