import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    title: 'Trusted recovery rewards',
    description:
      'Verify handovers, release payments securely, and keep community recoveries transparent.',
  },
  {
    title: 'Secure wallet tracking',
    description:
      'Every member has an internal wallet for balance tracking, pending payments, and withdrawal history.',
  },
  {
    title: 'Purpose-built for communities',
    description:
      'Encourage honest recovery work and turn lost item handovers into meaningful rewards.',
  },
];

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-slate-50">
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-emerald-300">
                Community Rewards
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Help reunite people with their lost belongings and earn rewards.
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                Turn honesty into opportunity with secure recovery payments,
                verified handovers, and wallet tracking built for trusted
                communities.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/(auth)/login"
                  className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Get started
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800"
                >
                  View dashboard
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="text-xl">Secure reward payments</CardTitle>
                  <CardDescription>
                    Every recovery payment is processed server-side and distributed
                    into the reward system automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-slate-300">
                    <li>Verified owner and finder confirmation</li>
                    <li>Automatic 80/20 distribution</li>
                    <li>Internal wallet ledger with history</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-800 bg-slate-900/80">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">
                Community Stories Coming Soon
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Purpose-built for people who want to help and be rewarded.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Our platform is designed to make recovery work rewarding, safe, and
                transparent for everyone involved.
              </p>
            </div>
            <Card className="border-slate-800 bg-slate-900/80">
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Sample success story
                  </p>
                  <p className="mt-3 text-base text-slate-300">
                    Verified handovers, secure payout distribution, and real-time
                    wallet tracking make it easy to reward finders and keep the
                    community safe.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <p className="text-sm font-semibold text-emerald-300">
                    Real review fields will be added from the admin dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
