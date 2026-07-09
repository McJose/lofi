'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value ?? 0));
}

export default function RevenuePage() {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((res) => res.json())
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <p className="text-slate-300">Loading revenue dashboard…</p>
      </div>
    );
  }

  const stats = [
    { label: 'Platform Earnings', value: formatCurrency(summary.platformEarnings) },
    { label: 'Daily Revenue', value: formatCurrency(summary.dailyRevenue) },
    { label: 'Weekly Revenue', value: formatCurrency(summary.weeklyRevenue) },
    { label: 'Monthly Revenue', value: formatCurrency(summary.monthlyRevenue) },
    { label: 'Total Wallet Balances', value: formatCurrency(summary.totalWalletBalances) },
    { label: 'Finder Earnings', value: formatCurrency(summary.finderEarnings) },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle>Revenue management</CardTitle>
            <CardDescription>
              Platform revenue, withdrawals, and wallet balances are tracked here.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="border-slate-800 bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Pending withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.pendingWithdrawals}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Completed withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.completedWithdrawals}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Failed withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.failedWithdrawals}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle>Commission history</CardTitle>
            <CardDescription>
              Commission analytics are captured at the transaction level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-slate-300">
              <p>All platform commission events are stored in the internal wallet ledger.</p>
              <p>Daily, weekly, and monthly revenue totals are generated server-side.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}import { cookies } from 'next/headers';

export async function getCurrentUserId(): Promise<string> {
  const cookieValue =
    cookies().get('userId')?.value || cookies().get('user_id')?.value;

  if (cookieValue) {
    return cookieValue;
  }

  throw new Error('Authentication required');
}import { cookies } from 'next/headers';

export async function getCurrentUserId(): Promise<string> {
  const cookieValue =
    cookies().get('userId')?.value || cookies().get('user_id')?.value;

  if (cookieValue) {
    return cookieValue;
  }

  throw new Error('Authentication required');
}import { cookies } from 'next/headers';

export async function getCurrentUserId(): Promise<string> {
  const cookieValue =
    cookies().get('userId')?.value || cookies().get('user_id')?.value;

  if (cookieValue) {
    return cookieValue;
  }

  throw new Error('Authentication required');
}