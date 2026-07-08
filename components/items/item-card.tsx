'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Eye, Heart, MessageCircle, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ItemWithRelations } from '@/types/items';
import { formatRelativeTime } from '@/lib/utils/response';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: ItemWithRelations;
  featured?: boolean;
  compact?: boolean;
  onFavorite?: (itemId: string) => void;
}

const statusColors = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  pending_claim: 'bg-yellow-500',
  claimed: 'bg-blue-500',
  recovered: 'bg-teal-500',
  archived: 'bg-gray-400',
};

const typeColors = {
  lost: 'bg-red-100 text-red-700 border-red-200',
  found: 'bg-green-100 text-green-700 border-green-200',
};

export function ItemCard({ item, featured = false, compact = false, onFavorite }: ItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryPhoto = item.photos?.[0] || null;
  const initials = item.profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const isLost = item.type === 'lost';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/items/${item.id}`}>
        <Card className={cn('overflow-hidden group cursor-pointer', featured && 'ring-2 ring-teal-500')}>
          {/* Image */}
          <div className={cn('relative bg-muted', compact ? 'aspect-video' : 'aspect-[4/3]')}>
            {primaryPhoto ? (
              <>
                {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
                <img
                  src={primaryPhoto}
                  alt={item.title}
                  className={cn(
                    'object-cover w-full h-full transition-all duration-300',
                    imageLoaded && 'opacity-100',
                    !imageLoaded && 'opacity-0',
                    isHovered && 'scale-105'
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <svg className="h-16 w-16 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge className={typeColors[item.type]} variant="outline">
                {item.type.toUpperCase()}
              </Badge>
              {item.match_score && item.match_score >= 70 && (
                <Badge className="bg-purple-500 text-white">
                  {item.match_score}% Match
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2">
              <Badge className="bg-black/50 text-white border-0">
                <div className={cn('w-2 h-2 rounded-full mr-1', statusColors[item.status])} />
                {item.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Favorite button */}
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFavorite(item.id);
                }}
                className={cn(
                  'absolute bottom-2 right-2 p-2 rounded-full transition-all bg-black/50 text-white hover:bg-black/70',
                  item.is_favorited && 'bg-red-500 hover:bg-red-600'
                )}
              >
                <Heart className={cn('h-4 w-4', item.is_favorited && 'fill-current')} />
              </button>
            )}

            {/* Featured badge */}
            {featured && (
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-teal-500 text-white border-0">Featured</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold line-clamp-1 group-hover:text-teal-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
              {item.primary_color && (
                <Badge variant="outline" className="text-xs">
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: item.primary_color }}
                  />
                  {item.primary_color}
                </Badge>
              )}
              {item.reward_amount && item.reward_amount > 0 && (
                <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                  ${item.reward_amount} Reward
                </Badge>
              )}
            </div>

            {/* Location & Date */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {(item.city || item.country) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{item.city || item.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatRelativeTime(item.created_at)}</span>
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          {!compact && item.profile && (
            <CardFooter className="px-4 py-3 border-t bg-muted/30">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.profile.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">@{item.profile.username}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.view_count}</span>
                  </div>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}

// Skeleton card for loading states
export function ItemCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden border bg-card">
      <div className={cn('bg-muted', compact ? 'aspect-video' : 'aspect-[4/3]')}>
        <div className="w-full h-full animate-pulse bg-muted" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
