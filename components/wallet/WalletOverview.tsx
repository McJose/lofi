import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value ?? 0));
}

export function WalletOverview({
  wallet,
}: {
  wallet: {
    currentBalance: number;
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
    lifetimeWithdrawals: number;
    totalRecoveries: number;
    totalPlatformFees: number;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCurrency(wallet.currentBalance)}</p>
          <p className="mt-2 text-sm text-slate-400">Includes available and pending funds.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCurrency(wallet.availableBalance)}</p>
          <p className="mt-2 text-sm text-slate-400">Ready for withdrawal.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Pending Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCurrency(wallet.pendingBalance)}</p>
          <p className="mt-2 text-sm text-slate-400">Pending recovery payouts and transfers.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Lifetime Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCurrency(wallet.lifetimeEarnings)}</p>
          <p className="mt-2 text-sm text-slate-400">Total earned from successful recoveries.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Lifetime Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCurrency(wallet.lifetimeWithdrawals)}</p>
          <p className="mt-2 text-sm text-slate-400">Total withdrawn via external payout methods.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Platform Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatCurrency(wallet.totalPlatformFees)}</p>
          <p className="mt-2 text-sm text-slate-400">Total platform commission collected.</p>
        </CardContent>
      </Card>
    </div>
  );
}

