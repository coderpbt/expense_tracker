import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { User } from '@/db/schema/models';

export async function GET() {
  await dbConnect();

  const users = [
    { username: 'arafat', password: '112233', role: 'admin' },
    { username: 'arif', password: '123', role: 'user' },
    { username: 'baba', password: '123', role: 'user' }
  ];

  const created = [];

  for (const u of users) {
    const exists = await User.findOne({ username: u.username }).lean();
    if (!exists) {
      const doc = await User.create(u);
      created.push(doc.username);
    }
  }

  return NextResponse.json({ created });
}
