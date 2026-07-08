'use client';

import { Camera, MapPin, Calendar, Award, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types';
import { formatRelativeTime } from '@/lib/utils/response';

interface ProfileHeaderProps {
  profile: Profile | null;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

export function ProfileHeader({ profile, isOwnProfile = false, onEditClick }: ProfileHeaderProps) {
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="relative mx-auto md:mx-0">
            <Avatar className="h-32 w-32 rounded-full border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-card border shadow-md hover:bg-muted transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {profile.verification_badge && (
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-3">@{profile.username}</p>

            {profile.bio && (
              <p className="text-foreground mb-4 max-w-lg">{profile.bio}</p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              {profile.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city ? `${profile.city}, ` : ''}{profile.country}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-600">{profile.reputation_score}</p>
                <p className="text-xs text-muted-foreground">Reputation</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.items_reported}</p>
                <p className="text-xs text-muted-foreground">Reported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.items_found}</p>
                <p className="text-xs text-muted-foreground">Found</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.items_returned}</p>
                <p className="text-xs text-muted-foreground">Returned</p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && onEditClick && (
            <Button variant="outline" className="shrink-0" onClick={onEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
