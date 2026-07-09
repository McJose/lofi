import { NextResponse } from 'next/server';
import { getPlatformRevenueSummary } from '@/lib/wallet';

export async function GET() {
  const summary = await getPlatformRevenueSummary();
  return NextResponse.json(summary);
}