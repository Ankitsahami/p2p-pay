import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

export const db = createClient({
  url,
  authToken,
});

export async function initDb() {
  try {
    await db.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT,
        wallet_address TEXT,
        contract_wallet_address TEXT,
        created_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        category TEXT,
        merchant TEXT,
        description TEXT,
        fiat_amount REAL,
        fiat_currency TEXT,
        crypto_amount REAL,
        token TEXT,
        network TEXT,
        status TEXT,
        tx_hash TEXT,
        wallet_address TEXT,
        created_at TEXT,
        completed_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS saved_billers (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        category TEXT,
        provider_id TEXT,
        consumer_number TEXT,
        consumer_name TEXT,
        nickname TEXT,
        last_paid_date TEXT,
        last_paid_amount REAL,
        created_at TEXT
      )`
    ], "write");
    console.log('[DB] Database tables initialized successfully.');
  } catch (err) {
    console.error('[DB] Error initializing database tables:', err);
    throw err;
  }
}
