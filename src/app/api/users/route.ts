import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, walletAddress, contractWalletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'walletAddress is required' }, { status: 400 });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const normalizedContractAddress = contractWalletAddress ? contractWalletAddress.toLowerCase() : null;

    // Check if user already exists
    const checkUser = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(wallet_address) = ? LIMIT 1',
      args: [normalizedAddress],
    });

    let user;
    if (checkUser.rows.length > 0) {
      user = checkUser.rows[0];
      // Update contract wallet address if changed
      if (normalizedContractAddress && user.contract_wallet_address !== normalizedContractAddress) {
        await db.execute({
          sql: 'UPDATE users SET contract_wallet_address = ? WHERE id = ?',
          args: [normalizedContractAddress, user.id],
        });
        user.contract_wallet_address = normalizedContractAddress;
      }
    } else {
      // Create new user
      const id = 'USER_' + Math.random().toString(36).substring(2, 11);
      const createdAt = new Date().toISOString();
      await db.execute({
        sql: 'INSERT INTO users (id, email, wallet_address, contract_wallet_address, created_at) VALUES (?, ?, ?, ?, ?)',
        args: [id, email || '', normalizedAddress, normalizedContractAddress || '', createdAt],
      });
      user = {
        id,
        email: email || '',
        wallet_address: normalizedAddress,
        contract_wallet_address: normalizedContractAddress || '',
        created_at: createdAt,
      };
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Database error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    const users = result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      walletAddress: row.wallet_address,
      contractWalletAddress: row.contract_wallet_address,
      createdAt: row.created_at,
    }));
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Database error' }, { status: 500 });
  }
}
