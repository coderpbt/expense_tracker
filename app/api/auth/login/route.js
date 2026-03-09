import { NextResponse } from 'next/server';
import { dbConnect } from '@/db/dbConnection/dbConnection';
import { User } from '@/db/schema/models';

export async function POST(req) {
  await dbConnect();
  const { username, password } = await req.json();

  const user = await User.findOne({ username, password }).lean();
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const payload = { id: String(user._id), username: user.username, role: user.role };

  const res = NextResponse.json({ ok: true, user: payload });
  res.cookies.set('expense_user', JSON.stringify(payload), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}
