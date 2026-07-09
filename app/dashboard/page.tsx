'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletOverview } from '@/components/wallet/WalletOverview';
import { TransactionsTable } from '@/components/wallet/TransactionsTable';
import { WithdrawalsPanel } from '@/components/wallet/WithdrawalsPanel';

type DashboardResponse = {
  wallet: any;
  transactions: Array<any>;
  withdrawals: Array<any>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/wallet')
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.error || 'Failed to load wallet.');
          });
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <p className="max-w-xl rounded-3xl border border-red-700 bg-red-950/60 p-6 text-red-200">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <p className="text-slate-300">Loading wallet dashboard…</p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Your wallet dashboard is the central place to review balances,
              view withdrawal activity, and monitor transaction history.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader>
              <CardTitle>Wallet overview</CardTitle>
            </CardHeader>
            <CardContent>
              <WalletOverview wallet={data.wallet} />
            </CardContent>
          </Card>

          <WithdrawalsPanel
            withdrawals={data.withdrawals}
            availableBalance={data.wallet.availableBalance}
          />
        </div>

        <TransactionsTable transactions={data.transactions} />
      </div>
    </main>
  );
}