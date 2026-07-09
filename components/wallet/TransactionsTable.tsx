import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value ?? 0));
}

export function TransactionsTable({
  transactions,
}: {
  transactions: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
    commission: number;
    netEarnings: number;
    reference: string;
    createdAt: string;
    recoveryId?: string;
  }>;
}) {
  if (!transactions?.length) {
    return (
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">No transactions available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80">
      <CardHeader>
        <CardTitle>Transaction history</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-slate-800 text-sm text-slate-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-slate-800">
                <td className="px-4 py-3">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{transaction.type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">{formatCurrency(transaction.amount)}</td>
                <td className="px-4 py-3">{formatCurrency(transaction.netEarnings)}</td>
                <td className="px-4 py-3">{transaction.status}</td>
                <td className="px-4 py-3">{transaction.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}