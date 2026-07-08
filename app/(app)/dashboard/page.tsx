'use client';

import { useAuth } from '@/hooks/use-auth';
import { StatsSection } from '@/components/landing/stats-section';

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your LoFi account.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border">
          <p className="text-sm text-muted-foreground">Items Reported</p>
          <p className="text-3xl font-bold">{profile?.items_reported || 0}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <p className="text-sm text-muted-foreground">Items Found</p>
          <p className="text-3xl font-bold">{profile?.items_found || 0}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <p className="text-sm text-muted-foreground">Items Returned</p>
          <p className="text-3xl font-bold">{profile?.items_returned || 0}</p>
        </div>
        <div className="bg-card rounded-xl p-6 border">
          <p className="text-sm text-muted-foreground">Reputation</p>
          <p className="text-3xl font-bold text-teal-600">{profile?.reputation_score || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-muted-foreground text-center py-8">
          <p>No recent activity to display.</p>
          <p className="text-sm mt-2">Report a lost item or search for found items to get started.</p>
        </div>
      </div>
    </div>
  );
}
