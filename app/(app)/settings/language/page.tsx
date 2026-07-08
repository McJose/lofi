'use client';

import { SettingsSidebar, LanguageSettingsCard } from '@/components/settings';

export default function LanguageSettingsPage() {
  return (
    <div className="container py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <SettingsSidebar />
        </aside>
        <div className="lg:col-span-3">
          <LanguageSettingsCard />
        </div>
      </div>
    </div>
  );
}
