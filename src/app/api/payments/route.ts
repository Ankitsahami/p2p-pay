import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { billDetails, quote, walletAddress } = body;

    if (!billDetails || !quote || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    const order = await PaymentService.initiateBillPayment(billDetails, quote, walletAddress);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
