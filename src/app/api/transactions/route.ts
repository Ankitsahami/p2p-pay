import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    let result;
    if (walletAddress) {
      result = await db.execute({
        sql: 'SELECT * FROM transactions WHERE LOWER(wallet_address) = ? ORDER BY created_at DESC',
        args: [walletAddress.toLowerCase()],
      });
    } else {
      result = await db.execute('SELECT * FROM transactions ORDER BY created_at DESC');
    }

    const txs = result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      category: row.category,
      merchant: row.merchant,
      description: row.description,
      fiatAmount: row.fiat_amount,
      fiatCurrency: row.fiat_currency,
      cryptoAmount: String(row.crypto_amount),
      token: row.token,
      network: row.network,
      status: row.status,
      txHash: row.tx_hash,
      walletAddress: row.wallet_address,
      timestamp: row.created_at,
      completedAt: row.completed_at,
    }));

    return NextResponse.json({ success: true, data: txs });
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
      type,
      category,
      merchant,
      description,
      fiatAmount,
      fiatCurrency,
      cryptoAmount,
      token,
      network,
      status,
      txHash,
      walletAddress,
    } = body;

    if (!id || !type || !walletAddress) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const createdAt = new Date().toISOString();

    const checkTx = await db.execute({
      sql: 'SELECT id FROM transactions WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (checkTx.rows.length > 0) {
      const updateFields: string[] = [];
      const updateArgs: any[] = [];

      if (status) {
        updateFields.push('status = ?');
        updateArgs.push(status);
        if (status === 'completed') {
          updateFields.push('completed_at = ?');
          updateArgs.push(new Date().toISOString());
        }
      }
      if (txHash) {
        updateFields.push('tx_hash = ?');
        updateArgs.push(txHash);
      }

      if (updateFields.length > 0) {
        updateArgs.push(id);
        await db.execute({
          sql: `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ?`,
          args: updateArgs,
        });
      }
    } else {
      await db.execute({
        sql: `INSERT INTO transactions (
          id, user_id, type, category, merchant, description,
          fiat_amount, fiat_currency, crypto_amount, token, network,
          status, tx_hash, wallet_address, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          userId || '',
          type,
          category || '',
          merchant || '',
          description || '',
          fiatAmount || 0,
          fiatCurrency || 'INR',
          parseFloat(cryptoAmount) || 0,
          token || 'USDC',
          network || 'Base Sepolia',
          status || 'pending',
          txHash || '',
          normalizedAddress,
          createdAt,
          status === 'completed' ? createdAt : '',
        ],
      });
    }

    return NextResponse.json({ success: true, message: 'Transaction recorded successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Database error' }, { status: 500 });
  }
}
