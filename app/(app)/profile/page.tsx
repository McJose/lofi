'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import { ProfileHeader, ProfileEditForm } from '@/components/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function ProfilePage() {
  const { profile, setProfile } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="container py-12 space-y-8">
      <ProfileHeader
        profile={profile}
        isOwnProfile={true}
        onEditClick={() => setIsEditOpen(true)}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileEditForm
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
