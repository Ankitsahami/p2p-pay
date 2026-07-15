import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'walletAddress is required' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM saved_billers WHERE LOWER(user_id) = ? ORDER BY created_at DESC',
      args: [walletAddress.toLowerCase()],
    });

    const billers = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      category: row.category,
      provider: {
        id: row.provider_id,
        name: row.provider_id.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      },
      consumerNumber: row.consumer_number,
      consumerName: row.consumer_name,
      nickname: row.nickname,
      lastPaidDate: row.last_paid_date,
      lastPaidAmount: row.last_paid_amount,
    }));

    return NextResponse.json({ success: true, data: billers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      category,
      providerId,
      consumerNumber,
      consumerName,
      nickname,
      lastPaidDate,
      lastPaidAmount,
    } = body;

    if (!id || !userId || !providerId || !consumerNumber) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const normalizedUserId = userId.toLowerCase();
    const createdAt = new Date().toISOString();

    const checkBiller = await db.execute({
      sql: 'SELECT id FROM saved_billers WHERE LOWER(user_id) = ? AND provider_id = ? AND consumer_number = ? LIMIT 1',
      args: [normalizedUserId, providerId, consumerNumber],
    });

    if (checkBiller.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE saved_billers SET last_paid_date = ?, last_paid_amount = ? WHERE id = ?',
        args: [lastPaidDate || '', parseFloat(lastPaidAmount) || 0, checkBiller.rows[0].id],
      });
    } else {
      await db.execute({
        sql: `INSERT INTO saved_billers (
          id, user_id, category, provider_id, consumer_number,
          consumer_name, nickname, last_paid_date, last_paid_amount, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          normalizedUserId,
          category || '',
          providerId,
          consumerNumber,
          consumerName || '',
          nickname || '',
          lastPaidDate || '',
          parseFloat(lastPaidAmount) || 0,
          createdAt,
        ],
      });
    }

    return NextResponse.json({ success: true, message: 'Saved biller updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Database error' }, { status: 500 });
  }
}
