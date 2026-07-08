'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getItem } from '@/services/items';
import { getMatchesForItem, confirmMatch, rejectMatch } from '@/services/matching';
import { toast } from '@/hooks/use-toast-store';
import { useAuth } from '@/hooks/use-auth';
import type { ItemWithRelations, ItemMatchWithItems } from '@/types/items';
import { cn } from '@/lib/utils';

export default function ItemMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user } = useAuth();

  const [item, setItem] = useState<ItemWithRelations | null>(null);
  const [matches, setMatches] = useState<ItemMatchWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [itemId]);

  const loadData = async () => {
    setIsLoading(true);
    const itemResult = await getItem(itemId, user?.id);
    if (itemResult.error) {
      toast.error('Error', itemResult.error);
      router.push('/');
      return;
    }
    setItem(itemResult.item);

    const matchesResult = await getMatchesForItem(itemId);
    if (matchesResult.error) {
      toast.error('Error loading matches', matchesResult.error);
    } else {
      setMatches(matchesResult.matches);
    }

    setIsLoading(false);
  };

  const handleConfirm = async (matchId: string) => {
    setPendingAction(matchId);
    const result = await confirmMatch(matchId, user?.id!);
    setPendingAction(null);

    if (result.error) {
      toast.error('Failed to confirm', result.error);
    } else {
      toast.success('Match confirmed', 'Contact the other party to arrange pickup.');
      loadData();
    }
  };

  const handleReject = async (matchId: string) => {
    setPendingAction(matchId);
    const result = await rejectMatch(matchId, user?.id!);
    setPendingAction(null);

    if (result.error) {
      toast.error('Failed to reject', result.error);
    } else {
      toast.success('Match rejected');
      loadData();
    }
  };

  if (isLoading || !item) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const confirmedMatches = matches.filter((m) => m.status === 'confirmed');
  const rejectedMatches = matches.filter((m) => m.status === 'rejected');

  return (
    <div className="container py-12">
      <Button variant="ghost" asChild className="-ml-4 mb-6">
        <Link href={`/items/${itemId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Item
        </Link>
      </Button>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Potential Matches</h1>
        <p className="text-muted-foreground">
          AI-powered matching results for "{item.title}"
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{matches.length}</div>
            <div className="text-sm text-muted-foreground">Total Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingMatches.length}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{confirmedMatches.length}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {matches.filter((m) => m.match_score >= 70).length}
            </div>
            <div className="text-sm text-muted-foreground">High Confidence</div>
          </CardContent>
        </Card>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No matches found yet</h3>
            <p className="text-muted-foreground">
              Our AI system is continuously searching for matches. You'll be notified when potential matches are found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingMatches.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedMatches.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                currentItem={item}
                onConfirm={() => handleConfirm(match.id)}
                onReject={() => handleReject(match.id)}
                isLoading={pendingAction === match.id}
              />
            ))}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentItem={item} isConfirmed />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentItem={item} isRejected />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface MatchCardProps {
  match: ItemMatchWithItems;
  currentItem: ItemWithRelations;
  onConfirm?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
  isConfirmed?: boolean;
  isRejected?: boolean;
}

function MatchCard({
  match,
  currentItem,
  onConfirm,
  onReject,
  isLoading,
  isConfirmed,
  isRejected,
}: MatchCardProps) {
  const matchedItem = currentItem.type === 'lost' ? match.found_item : match.lost_item;

  if (!matchedItem) return null;

  const scoreColor =
    match.match_score >= 70
      ? 'text-green-600'
      : match.match_score >= 40
        ? 'text-yellow-600'
        : 'text-orange-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(isConfirmed && 'border-green-500', isRejected && 'border-red-300 opacity-60')}>
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Match Score */}
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <div className={cn('text-3xl font-bold', scoreColor)}>
                {match.match_score}%
              </div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>

            {/* Item Info */}
            <div className="flex-1 flex gap-4">
              {matchedItem.photos?.[0] && (
                <img
                  src={matchedItem.photos[0]}
                  alt={matchedItem.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{matchedItem.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {matchedItem.description}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/items/${matchedItem.id}`}>View Details</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{matchedItem.category}</Badge>
                  {matchedItem.primary_color && (
                    <Badge variant="secondary">{matchedItem.primary_color}</Badge>
                  )}
                  {matchedItem.city && (
                    <Badge variant="secondary">{matchedItem.city}</Badge>
                  )}
                </div>

                {/* Similarity Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {match.text_similarity !== null && (
                    <div>
                      <span className="text-muted-foreground">Text:</span>{' '}
                      <span className="font-medium">{match.text_similarity}%</span>
                    </div>
                  )}
                  {match.location_similarity !== null && (
                    <div>
                      <span className="text-muted-foreground">Location:</span>{' '}
                      <span className="font-medium">{match.location_similarity}%</span>
                    </div>
                  )}
                  {match.date_similarity !== null && (
                    <div>
                      <span className="text-muted-foreground">Date:</span>{' '}
                      <span className="font-medium">{match.date_similarity}%</span>
                    </div>
                  )}
                  {match.image_similarity !== null && (
                    <div>
                      <span className="text-muted-foreground">Image:</span>{' '}
                      <span className="font-medium">{match.image_similarity}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isConfirmed && !isRejected && onConfirm && onReject && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Not a Match
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                This is a Match
              </Button>
            </div>
          )}

          {isConfirmed && (
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Match Confirmed</span>
            </div>
          )}

          {isRejected && (
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Match Rejected</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
