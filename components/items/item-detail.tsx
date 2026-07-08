'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Shield,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ItemWithRelations, ItemMatch } from '@/types/items';
import { ITEM_CONDITIONS } from '@/types/items';
import { formatRelativeTime } from '@/lib/utils/response';
import { toggleFavorite } from '@/services/favorites';
import { createReport } from '@/services/reports';
import { toast } from '@/hooks/use-toast-store';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface ItemDetailProps {
  item: ItemWithRelations;
  matches?: ItemMatch[];
}

const typeColors = {
  lost: 'bg-red-500 text-white',
  found: 'bg-green-500 text-white',
};

const statusColors = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  pending_claim: 'bg-yellow-500',
  claimed: 'bg-blue-500',
  recovered: 'bg-teal-500',
  archived: 'bg-gray-400',
};

export function ItemDetail({ item, matches = [] }: ItemDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(item.is_favorited || false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const isOwner = user?.id === item.user_id;
  const canClaim = !isOwner && item.type === 'found' && item.status === 'active' && isAuthenticated;
  const isLost = item.type === 'lost';

  const initials = item.profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const condition = ITEM_CONDITIONS.find((c) => c.id === item.condition);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in required', 'Please sign in to favorite items.');
      return;
    }

    const result = await toggleFavorite(user!.id!, item.id);
    if (result.error) {
      toast.error('Error', result.error);
    } else {
      setIsFavorited(result.favorited);
      toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Found on FindBack: ${item.title}`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied', 'Share link copied to clipboard.');
    }
  };

  const handleReport = async (reason: string, description: string) => {
    setIsReporting(true);
    const result = await createReport(user?.id || null, {
      item_id: item.id,
      reason: reason as any,
      description,
    });
    setIsReporting(false);

    if (result.error) {
      toast.error('Failed to report', result.error);
    } else {
      toast.success('Report submitted', 'Thank you for helping keep FindBack safe.');
      setReportDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/${item.type}-items`} className="hover:text-foreground">
          {isLost ? 'Lost' : 'Found'} Items
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate">{item.title}</span>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {item.photos?.length > 0 ? (
                <>
                  <img
                    src={item.photos[currentPhotoIndex]}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />

                  {item.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentPhotoIndex((i) => (i - 1 + item.photos.length) % item.photos.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPhotoIndex((i) => (i + 1) % item.photos.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {item.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhotoIndex(i)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          i === currentPhotoIndex ? 'bg-white w-4' : 'bg-white/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <svg className="h-24 w-24 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}

              {/* Status & Type Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={typeColors[item.type]}>
                  {item.type.toUpperCase()}
                </Badge>
                <Badge className="bg-black/50 text-white border-0">
                  <div className={cn('w-2 h-2 rounded-full mr-1', statusColors[item.status])} />
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {item.photos?.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {item.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0',
                      i === currentPhotoIndex && 'ring-2 ring-primary'
                    )}
                  >
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{item.description}</p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <DetailRow label="Category" value={item.category} />
                {item.brand && <DetailRow label="Brand" value={item.brand} />}
                {item.model && <DetailRow label="Model" value={item.model} />}
                {item.serial_number && <DetailRow label="Serial Number" value={item.serial_number} isSensitive />}
                {item.primary_color && (
                  <DetailRow
                    label="Primary Color"
                    value={
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.primary_color }}
                        />
                        {item.primary_color}
                      </div>
                    }
                  />
                )}
                {item.secondary_color && (
                  <DetailRow
                    label="Secondary Color"
                    value={
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.secondary_color }}
                        />
                        {item.secondary_color}
                      </div>
                    }
                  />
                )}
                {item.size && <DetailRow label="Size" value={item.size} />}
                {item.unique_identifiers?.length > 0 && (
                  <DetailRow
                    label="Unique Identifiers"
                    value={item.unique_identifiers.join(', ')}
                    className="sm:col-span-2"
                  />
                )}
                {condition && <DetailRow label="Condition" value={condition.name} />}
                {item.reward_amount && item.reward_amount > 0 && (
                  <DetailRow
                    label="Reward"
                    value={
                      <span className="text-lg font-bold text-yellow-600">
                        ${item.reward_amount}
                      </span>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.address && <p>{item.address}</p>}
                <p>
                  {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                  {item.postal_code && ` (${item.postal_code})`}
                </p>
                {item.latitude && item.longitude && (
                  <p className="text-sm text-muted-foreground">
                    GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(item.date_lost_found).toLocaleDateString()}
                  {item.time_lost_found && ` at ${item.time_lost_found}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Found Item Specific */}
          {!isLost && (item.holder_name || item.police_station || item.safe_storage_location) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Custody Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.holder_name && <DetailRow label="Holder" value={item.holder_name} />}
                {item.police_station && <DetailRow label="Police Station" value={item.police_station} />}
                {item.safe_storage_location && (
                  <DetailRow label="Storage Location" value={item.safe_storage_location} />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Owner */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Claim Button */}
              {canClaim && (
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600"
                  asChild
                >
                  <Link href={`/items/${item.id}/claim`}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Claim This Item
                  </Link>
                </Button>
              )}

              {/* Contact Owner */}
              {isAuthenticated && !isOwner && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/messages/${item.user_id}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Owner
                  </Link>
                </Button>
              )}

              {/* Favorite & Share */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleFavorite}
                >
                  <Heart
                    className={cn('h-4 w-4 mr-2', isFavorited && 'fill-current text-red-500')}
                  />
                  {isFavorited ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Edit (Owner) */}
              {isOwner && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/items/${item.id}/edit`}>Edit Item</Link>
                </Button>
              )}

              {/* Report */}
              {!isOwner && (
                <ReportDialog
                  open={reportDialogOpen}
                  onOpenChange={setReportDialogOpen}
                  onReport={handleReport}
                  isLoading={isReporting}
                />
              )}
            </CardContent>
          </Card>

          {/* Match Alert */}
          {item.match_score && item.match_score >= 70 && (
            <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800 dark:text-purple-200">
                High Match Score!
              </AlertTitle>
              <AlertDescription className="text-purple-700 dark:text-purple-300">
                This item has a {item.match_score}% match with another item.{' '}
                <Link href={`/items/${item.id}/matches`} className="underline font-medium">
                  View matches
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Owner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isLost ? 'Owner' : 'Finder'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/profile/${item.profile?.username}`} className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={item.profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{item.profile?.username}</p>
                </div>
                {item.profile?.verification_badge && (
                  <Badge className="ml-auto">Verified</Badge>
                )}
              </Link>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{item.profile?.reputation_score || 0}</p>
                  <p className="text-xs text-muted-foreground">Reputation</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.view_count}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatRelativeTime(item.created_at).split(' ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">Posted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Preference */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  Contact via: <Badge variant="outline">{item.contact_preference.replace('_', '-')}</Badge>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component
function DetailRow({
  label,
  value,
  isSensitive = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  isSensitive?: boolean;
  className?: string;
}) {
  const [isHidden, setIsHidden] = useState(isSensitive);

  return (
    <div className={cn('space-y-1', className)}>
      <Label className="text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        {isHidden ? (
          <span className="text-muted-foreground">••••••••</span>
        ) : (
          <span className="font-medium">{value}</span>
        )}
        {isSensitive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? 'Show' : 'Hide'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Report Dialog
function ReportDialog({
  open,
  onOpenChange,
  onReport,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (reason: string, description: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!reason) return;
    onReport(reason, description);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
          <Flag className="h-4 w-4 mr-2" />
          Report Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Item</DialogTitle>
          <DialogDescription>
            Help us keep FindBack safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fake">Fake/Fraudulent listing</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="duplicate">Duplicate post</SelectItem>
                <SelectItem value="fraud">Suspicious activity</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Details (optional)</Label>
            <Textarea
              placeholder="Provide additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || isLoading}
              className="flex-1"
            >
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
