import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { getWalletDashboard } from '@/lib/wallet';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const dashboard = await getWalletDashboard(userId);
    return NextResponse.json(dashboard);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unable to load wallet.' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    );
  }
}