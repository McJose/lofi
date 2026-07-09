'use client';

import { useState } from 'react';
import { WALLET_MAX_WITHDRAWAL, WALLET_MIN_WITHDRAWAL } from '@/lib/wallet-constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function WithdrawalsPanel({
  withdrawals,
  availableBalance,
}: {
  withdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    initiatedAt: string;
    completedAt?: string;
    externalReference?: string;
  }>;
  availableBalance: number;
}) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), mpesaPhone: phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Withdrawal could not be created.');
      }

      setMessage('Withdrawal request submitted successfully.');
      setAmount('');
      setPhone('');
    } catch (error: any) {
      setMessage(error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Request withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Available balance: ${availableBalance.toFixed(2)}
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Amount</label>
              <input
                type="number"
                min={WALLET_MIN_WITHDRAWAL}
                max={WALLET_MAX_WITHDRAWAL}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                placeholder="Amount"
              />
              <p className="text-xs text-slate-500">
                Minimum ${WALLET_MIN_WITHDRAWAL}, maximum ${WALLET_MAX_WITHDRAWAL}.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">M-Pesa phone</label>
              <input
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                placeholder="+254700000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full justify-center rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit withdrawal'}
            </button>
            {message ? <p className="text-sm text-slate-300">{message}</p> : null}
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Recent withdrawal activity</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals?.length ? (
            <div className="space-y-3 text-sm text-slate-200">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p>${withdrawal.amount.toFixed(2)}</p>
                    <span className="text-xs text-slate-400">{withdrawal.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Requested {new Date(withdrawal.initiatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No withdrawals yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}