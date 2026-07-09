import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { requestWithdrawal } from '@/lib/withdrawals';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getCurrentUserId();

    const withdrawal = await requestWithdrawal(
      userId,
      Number(body.amount),
      String(body.mpesaPhone)
    );

    return NextResponse.json(withdrawal);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unable to process withdrawal.' },
      { status: 400 }
    );
  }
}
