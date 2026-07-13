import { NextResponse } from 'next/server';
import { BillService } from '@/services/bill-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const consumerNumber = searchParams.get('consumerNumber');
    const categoryId = searchParams.get('categoryId');

    // 1. If only fetching providers list for category
    if (categoryId && !providerId) {
      const providers = BillService.getProviders(categoryId);
      return NextResponse.json({ success: true, data: providers });
    }

    // 2. Fetch specific bill dues
    if (!providerId || !consumerNumber) {
      return NextResponse.json(
        { success: false, error: 'providerId and consumerNumber are required' },
        { status: 400 }
      );
    }

    const bill = await BillService.fetchBill(providerId, consumerNumber);
    return NextResponse.json({ success: true, data: bill });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}
