import { NextResponse } from 'next/server';

// Server-side PDF generation removed. Use client-side html2pdf instead.
export async function GET() {
  return NextResponse.json({ error: 'Client-side export only. Use the Reports page export button.' }, { status: 400 });
}
