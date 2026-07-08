'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Shield, Bell, Eye, Palette, Globe, Lock } from 'lucide-react';

const settingsNav = [
  { name: 'Account', href: '/settings/account', icon: User },
  { name: 'Privacy', href: '/settings/privacy', icon: Eye },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Appearance', href: '/settings/theme', icon: Palette },
  { name: 'Language', href: '/settings/language', icon: Globe },
  { name: 'Security', href: '/settings/security', icon: Shield },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {settingsNav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
