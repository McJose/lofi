'use client';

import { SettingsSidebar, SecuritySettingsCard } from '@/components/settings';

export default function SecuritySettingsPage() {
  return (
    <div className="container py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <SettingsSidebar />
        </aside>
        <div className="lg:col-span-3">
          <SecuritySettingsCard />
        </div>
      </div>
    </div>
  );
}
