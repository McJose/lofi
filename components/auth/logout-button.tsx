'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/auth';
import { useAuthStore } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast-store';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({ variant = 'ghost', showIcon = true, className }: LogoutButtonProps) {
  const router = useRouter();
  const { reset } = useAuthStore();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      toast.error('Logout failed', error);
      return;
    }

    reset();
    toast.success('Logged out', 'You have been signed out.');
    router.push('/');
  };

  return (
    <Button variant={variant} className={className} onClick={handleLogout}>
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Log out
    </Button>
  );
}
