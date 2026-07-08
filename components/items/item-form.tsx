'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Plus, X, MapPin, Camera, Calendar, DollarSign, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { itemSchema, type ItemFormData } from '@/validation/items';
import { ITEM_CATEGORIES, ITEM_COLORS, ITEM_CONDITIONS } from '@/types/items';
import { createItem, updateItem } from '@/services/items';
import { toast } from '@/hooks/use-toast-store';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface ItemFormProps {
  type: 'lost' | 'found';
  initialData?: Partial<ItemFormData>;
  itemId?: string;
  onSuccess?: (itemId: string) => void;
  onCancel?: () => void;
}

const AUTOSAVE_KEY = 'findback_item_draft';

export function ItemForm({ type, initialData, itemId, onSuccess, onCancel }: ItemFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      type,
      title: initialData?.title || '',
      category: initialData?.category || '',
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      serial_number: initialData?.serial_number || '',
      description: initialData?.description || '',
      primary_color: initialData?.primary_color || '',
      secondary_color: initialData?.secondary_color || '',
      size: initialData?.size || '',
      unique_identifiers: initialData?.unique_identifiers || [],
      date_lost_found: initialData?.date_lost_found || new Date().toISOString().split('T')[0],
      time_lost_found: initialData?.time_lost_found || '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
      postal_code: initialData?.postal_code || '',
      reward_amount: initialData?.reward_amount || 0,
      photos: initialData?.photos || [],
      video_url: initialData?.video_url || '',
      privacy_level: initialData?.privacy_level || 'public',
      contact_preference: initialData?.contact_preference || 'in_app',
      holder_name: initialData?.holder_name || '',
      police_station: initialData?.police_station || '',
      safe_storage_location: initialData?.safe_storage_location || '',
      condition: initialData?.condition || '',
    },
  });

  const { fields: identifierFields, append: appendIdentifier, remove: removeIdentifier } = useFieldArray({
    control,
    name: 'unique_identifiers' as never,
  });

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Location not available', 'Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);

        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          if (data.address) {
            setValue('address', data.display_name);
            setValue('city', data.address.city || data.address.town || data.address.village || '');
            setValue('state', data.address.state || '');
            setValue('country', data.address.country || '');
            setValue('postal_code', data.address.postcode || '');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }

        toast.success('Location captured', 'Your location has been set.');
      },
      (error) => {
        toast.error('Location error', error.message);
      }
    );
  }, [setValue]);

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 10) {
      toast.error('Too many photos', 'Maximum 10 photos allowed.');
      return;
    }

    // Convert to base64 for demo (in production, upload to Supabase Storage)
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', `${file.name} exceeds 5MB limit.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Autosave draft
  useEffect(() => {
    if (!isDirty) return;

    const saveDraft = async () => {
      setIsSavingDraft(true);
      const formData = watch();
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...formData, photos, type }));
      setLastSaved(new Date());
      setIsSavingDraft(false);
    };

    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [watch, isDirty, photos, type]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      if (draft.type === type) {
        Object.entries(draft).forEach(([key, value]) => {
          if (key !== 'photos') {
            setValue(key as keyof ItemFormData, value as never);
          }
        });
        if (draft.photos) {
          setPhotos(draft.photos);
        }
      }
    }
  }, [type, setValue]);

  const onSubmit = async (data: ItemFormData, status: 'draft' | 'active' = 'active') => {
    if (!user) {
      toast.error('Authentication required', 'Please sign in to report an item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalData = { ...data, photos };

      let result;
      if (itemId) {
        result = await updateItem(itemId, user.id, finalData);
      } else {
        result = await createItem(user.id, finalData, status);
      }

      if (result.error) {
        toast.error(status === 'draft' ? 'Failed to save draft' : 'Failed to submit', result.error);
        return;
      }

      localStorage.removeItem(AUTOSAVE_KEY);
      toast.success(
        status === 'draft' ? 'Draft saved' : 'Item reported',
        status === 'draft'
          ? 'Your draft has been saved.'
          : 'Your item has been reported and is now visible to the community.'
      );
      onSuccess?.(result.item?.id || '');
    } catch (error) {
      toast.error('Something went wrong', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watching = watch();

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, 'active'))} className="space-y-8">
      {/* Autosave indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {isSavingDraft ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving draft...
          </span>
        ) : lastSaved ? (
          <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
        ) : (
          <span />
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide details about the {type === 'lost' ? 'lost' : 'found'} item.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Blue iPhone 15 Pro Max"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)} defaultValue={watching.category}>
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.filter((c) => !('parent' in c)).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="e.g., Apple, Samsung" {...register('brand')} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="e.g., iPhone 15 Pro Max" {...register('model')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input id="serial_number" placeholder="e.g., C8QX..." {...register('serial_number')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description including any distinguishing features, engravings, damage, etc."
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Describe the physical appearance of the item.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <Select onValueChange={(value) => setValue('primary_color', value)} defaultValue={watching.primary_color}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <Select onValueChange={(value) => setValue('secondary_color', value)} defaultValue={watching.secondary_color}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {ITEM_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" placeholder="e.g., Medium, 15 inch" {...register('size')} />
            </div>
          </div>

          {/* Unique Identifiers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Unique Identifiers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendIdentifier('')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {identifierFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`unique_identifiers.${index}`)}
                  placeholder="e.g., Engraved initials 'JD' on back"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIdentifier(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location & Date */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Date</CardTitle>
          <CardDescription>
            When and where was the item {type === 'lost' ? 'lost' : 'found'}?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_lost_found">Date *</Label>
              <Input
                id="date_lost_found"
                type="date"
                {...register('date_lost_found')}
                className={errors.date_lost_found ? 'border-destructive' : ''}
              />
              {errors.date_lost_found && <p className="text-sm text-destructive">{errors.date_lost_found.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_lost_found">Time (approximate)</Label>
              <Input id="time_lost_found" type="time" {...register('time_lost_found')} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Location</Label>
              <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                <MapPin className="h-4 w-4 mr-1" />
                Use Current Location
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Street address" {...register('address')} />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" {...register('city')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" placeholder="State" {...register('state')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="Country" {...register('country')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input id="postal_code" placeholder="ZIP" {...register('postal_code')} />
              </div>
            </div>

            {/* Hidden coordinates */}
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
            {watching.latitude && watching.longitude && (
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                GPS: {watching.latitude.toFixed(4)}, {watching.longitude.toFixed(4)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>
            Upload up to 10 photos of the item. Clear photos help with matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img src={photo} alt={`Photo ${index + 1}`} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}

            {photos.length < 10 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mt-1">Add Photo</span>
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

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (optional)</Label>
            <Input
              id="video_url"
              placeholder="https://youtube.com/watch?v=..."
              {...register('video_url')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {type === 'lost' && (
            <div className="space-y-2">
              <Label htmlFor="reward_amount">Reward Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reward_amount"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...register('reward_amount', { valueAsNumber: true })}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {type === 'found' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Item Condition</Label>
                <Select onValueChange={(value) => setValue('condition', value)} defaultValue={watching.condition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CONDITIONS.map((cond) => (
                      <SelectItem key={cond.id} value={cond.id}>
                        <div>
                          <div className="font-medium">{cond.name}</div>
                          <div className="text-xs text-muted-foreground">{cond.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holder_name">Holder Name (optional)</Label>
                <Input id="holder_name" placeholder="Who currently has the item?" {...register('holder_name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safe_storage_location">Storage Location</Label>
                <Input
                  id="safe_storage_location"
                  placeholder="Where is the item being stored?"
                  {...register('safe_storage_location')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="police_station">Police Station (if reported)</Label>
                <Input
                  id="police_station"
                  placeholder="Police station name/reference number"
                  {...register('police_station')}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contact Preference</Label>
              <Select onValueChange={(v) => setValue('contact_preference', v as 'in_app' | 'email' | 'phone')} defaultValue={watching.contact_preference}>
                <SelectTrigger>
                  <SelectValue placeholder="How should people contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-App Messages</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Privacy Level</Label>
              <Select onValueChange={(v) => setValue('privacy_level', v as 'public' | 'limited' | 'private')} defaultValue={watching.privacy_level}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">Visible to everyone</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="limited">
                    <div>
                      <div className="font-medium">Limited</div>
                      <div className="text-xs text-muted-foreground">Hide exact location</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-muted-foreground">Only visible to matched users</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSubmit(watch(), 'draft')}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Draft
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              {type === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
            </>
          )}
        </Button>
      </div>

      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      )}
    </form>
  );
}
