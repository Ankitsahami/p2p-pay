import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ success: true, message: 'Database tables initialized successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to initialize database' }, { status: 500 });
  }
}
