'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { securitySettingsSchema, type SecuritySettingsFormData } from '@/validation/settings';
import { changePassword } from '@/services/settings';
import { toast } from '@/hooks/use-toast-store';
import { useAuth } from '@/hooks/use-auth';

export function SecuritySettingsCard() {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
  });

  const onChangePassword = async (data: SecuritySettingsFormData) => {
    setIsChangingPassword(true);
    try {
      const { error } = await changePassword(data.current_password, data.new_password);
      if (error) {
        toast.error('Password change failed', error);
        return;
      }
      toast.success('Password changed', 'Your password has been updated successfully.');
      reset();
    } catch (error) {
      toast.error('Something went wrong', 'Please try again later.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change Form */}
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                {...register('current_password')}
                disabled={isChangingPassword}
              />
              {errors.current_password && (
                <p className="text-sm text-destructive">{errors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                {...register('new_password')}
                disabled={isChangingPassword}
              />
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_new_password">Confirm New Password</Label>
              <Input
                id="confirm_new_password"
                type="password"
                {...register('confirm_new_password')}
                disabled={isChangingPassword}
              />
              {errors.confirm_new_password && (
                <p className="text-sm text-destructive">{errors.confirm_new_password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that can affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Deleting your account is permanent and cannot be undone. All your data, including profile, items, and messages will be deleted.
            </AlertDescription>
          </Alert>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                toast.info('Account deletion', 'This feature will be available soon.');
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
