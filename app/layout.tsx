/*import './globals.css';*/
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { MainNav } from '@/components/navigation/MainNav';

export const metadata: Metadata = {
  title: 'Lofi | Lost & Found Rewards',
  description: 'Help reunite people with lost belongings, earn rewards, and track wallet activity securely.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'Lofi | Lost & Found Rewards',
    description: 'A secure lost and found platform built around community recovery and verified rewards.',
    type: 'website',
    images: ['/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lofi',
    description: 'Recover lost items. Earn rewards. Strengthen your community.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <MainNav />
        {children}
      </body>
    </html>
  );
}
