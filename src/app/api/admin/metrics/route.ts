import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const volumeResult = await db.execute(`
      SELECT 
        SUM(crypto_amount) as totalVolume,
        COUNT(*) as totalTxCount,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTxCount
      FROM transactions
    `);

    const totalVolume = Number(volumeResult.rows[0].totalVolume || 0);
    const totalTxCount = Number(volumeResult.rows[0].totalTxCount || 0);
    const completedTxCount = Number(volumeResult.rows[0].completedTxCount || 0);
    const successRate = totalTxCount > 0 ? Math.round((completedTxCount / totalTxCount) * 100) : 100;

    const usersResult = await db.execute(`SELECT COUNT(*) as userCount FROM users`);
    const totalUsers = Number(usersResult.rows[0].userCount || 0);

    const today = new Date().toISOString().split('T')[0];
    const todayResult = await db.execute({
      sql: `SELECT SUM(crypto_amount) as todayVolume FROM transactions WHERE created_at LIKE ?`,
      args: [`${today}%`],
    });
    const todayVolume = Number(todayResult.rows[0].todayVolume || 0);

    const categoryResult = await db.execute(`
      SELECT category, SUM(crypto_amount) as amount, COUNT(*) as count 
      FROM transactions 
      GROUP BY category
    `);

    const categoryBreakdown = categoryResult.rows.map((row: any) => ({
      category: row.category || 'unknown',
      amount: Number(row.amount || 0),
      count: Number(row.count || 0),
    }));

    const dailyData: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResult = await db.execute({
        sql: `SELECT SUM(crypto_amount) as volume, COUNT(*) as count FROM transactions WHERE created_at LIKE ?`,
        args: [`${dateStr}%`],
      });

      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData.push({
        name: label,
        volume: Number(dayResult.rows[0].volume || 0),
        transactions: Number(dayResult.rows[0].count || 0),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalVolume,
          todayVolume,
          totalUsers,
          successRate,
          totalTxCount,
        },
        categoryBreakdown,
        dailyData,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Database error' }, { status: 500 });
  }
}
