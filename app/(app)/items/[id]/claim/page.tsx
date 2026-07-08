'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getItem } from '@/services/items';
import { createClaim } from '@/services/claims';
import { claimSchema, ownershipQuestionnaireSchema, type ClaimFormData, type OwnershipQuestionnaireData } from '@/validation/items';
import { toast } from '@/hooks/use-toast-store';
import { useAuth } from '@/hooks/use-auth';
import type { ItemWithRelations } from '@/types/items';

export default function ClaimItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState<ItemWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const [receiptUrl, setReceiptUrl] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      item_id: itemId,
      message: '',
      proof_photos: [],
      questionnaire_answers: {},
    },
  });

  const {
    register: registerQuestionnaire,
    watch: watchQuestionnaire,
  } = useForm<OwnershipQuestionnaireData>({
    resolver: zodResolver(ownershipQuestionnaireSchema),
    defaultValues: {
      where_did_you_get_it: '',
      when_did_you_get_it: '',
      distinguishing_features: '',
      additional_proof: '',
    },
  });

  useEffect(() => {
    loadItem();
  }, [itemId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/items/${itemId}/claim`);
    }
  }, [isAuthenticated, router, itemId]);

  const loadItem = async () => {
    setIsLoading(true);
    const result = await getItem(itemId, user?.id);
    if (result.error) {
      toast.error('Error', result.error);
      router.push('/found-items');
      return;
    }
    if (result.item?.type !== 'found') {
      toast.error('Invalid item', 'You can only claim found items.');
      router.push('/found-items');
      return;
    }
    setItem(result.item);
    setIsLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (proofPhotos.length + files.length > 5) {
      toast.error('Too many photos', 'Maximum 5 proof photos allowed.');
      return;
    }

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProofPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setProofPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    const questionnaireAnswers: Record<string, string> = {
      where_did_you_get_it: watchQuestionnaire('where_did_you_get_it') || '',
      when_did_you_get_it: watchQuestionnaire('when_did_you_get_it') || '',
      distinguishing_features: watchQuestionnaire('distinguishing_features') || '',
      additional_proof: watchQuestionnaire('additional_proof') || '',
    };

    const data: ClaimFormData = {
      item_id: itemId,
      message: watch('message'),
      proof_photos: proofPhotos,
      proof_receipt_url: receiptUrl || undefined,
      questionnaire_answers: questionnaireAnswers,
    };

    const result = await createClaim(user.id!, data);

    if (result.error) {
      toast.error('Failed to submit claim', result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success('Claim submitted', 'The finder will review your claim shortly.');
    router.push(`/items/${itemId}`);
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

  return (
    <div className="container py-12 max-w-3xl">
      <Button variant="ghost" asChild className="-ml-4 mb-6">
        <Link href={`/items/${itemId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Item
        </Link>
      </Button>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Claim This Item</h1>
        <p className="text-muted-foreground">
          Provide proof of ownership to claim this found item.
        </p>
      </div>

      {/* Item Summary */}
      <Card className="mb-6">
        <CardContent className="p-4 flex gap-4">
          {item.photos?.[0] && (
            <img
              src={item.photos[0]}
              alt={item.title}
              className="w-24 h-24 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{item.category}</Badge>
              {item.primary_color && <Badge variant="secondary">{item.primary_color}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Provide as much detail as possible to establish your ownership. False claims may result in account suspension.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Ownership Questionnaire */}
        <Card>
          <CardHeader>
            <CardTitle>Ownership Verification</CardTitle>
            <CardDescription>
              Answer the following questions to help verify your ownership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="where_did_you_get_it">Where did you get this item? *</Label>
              <Textarea
                id="where_did_you_get_it"
                placeholder="e.g., Purchased from Apple Store on 5th Avenue"
                {...registerQuestionnaire('where_did_you_get_it')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="when_did_you_get_it">When did you get it? *</Label>
              <Input
                id="when_did_you_get_it"
                placeholder="e.g., March 2024 or 6 months ago"
                {...registerQuestionnaire('when_did_you_get_it')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distinguishing_features">Distinguishing features or markings</Label>
              <Textarea
                id="distinguishing_features"
                placeholder="e.g., Has a scratch on the back, initials engraved inside"
                {...registerQuestionnaire('distinguishing_features')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_proof">Additional proof or information</Label>
              <Textarea
                id="additional_proof"
                placeholder="Any other details that can help verify your ownership..."
                {...registerQuestionnaire('additional_proof')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Proof Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Ownership</CardTitle>
            <CardDescription>
              Upload photos of receipts, warranties, or other documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Proof Photos (up to 5)</Label>
              <div className="grid grid-cols-5 gap-4">
                {proofPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={photo} alt={`Proof ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {proofPhotos.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_url">Receipt/Document URL (optional)</Label>
              <Input
                id="receipt_url"
                placeholder="https://..."
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
              />
            </div>

            {item.serial_number && (
              <div className="space-y-2">
                <Label htmlFor="serial_proof">Serial Number Verification</Label>
                <Input
                  id="serial_proof"
                  placeholder="Enter the serial number of this item"
                  {...register('serial_number_proof')}
                />
                <p className="text-xs text-muted-foreground">
                  This item has a registered serial number. If you know it, enter it above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message */}
        <Card>
          <CardHeader>
            <CardTitle>Message to Finder</CardTitle>
            <CardDescription>
              Explain why you believe this is your item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your item and explain how you lost it..."
                rows={4}
                {...register('message')}
                className={errors.message ? 'border-destructive' : ''}
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Claim
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
