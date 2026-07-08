import { z } from 'zod';

// Item Schema
export const itemSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  serial_number: z.string().max(100).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  size: z.string().max(50).optional(),
  unique_identifiers: z.array(z.string().max(100)).default([]),
  date_lost_found: z.string().min(1, 'Date is required'),
  time_lost_found: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  reward_amount: z.number().min(0).max(1000000).optional(),
  photos: z.array(z.string().url()).max(10),
  video_url: z.string().url().optional().or(z.literal('')),
  privacy_level: z.enum(['public', 'limited', 'private']).default('public'),
  contact_preference: z.enum(['in_app', 'email', 'phone']).default('in_app'),
  // Found item specific fields
  holder_name: z.string().max(100).optional(),
  police_station: z.string().max(200).optional(),
  safe_storage_location: z.string().max(200).optional(),
  condition: z.string().optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;

// Claim Schema
export const claimSchema = z.object({
  item_id: z.string().uuid(),
  message: z.string().min(20, 'Message must be at least 20 characters').max(1000, 'Message cannot exceed 1000 characters'),
  proof_photos: z.array(z.string().url()).max(5),
  proof_receipt_url: z.string().url().optional().or(z.literal('')),
  serial_number_proof: z.string().max(100).optional(),
  questionnaire_answers: z.record(z.string(), z.string()),
});

export type ClaimFormData = z.infer<typeof claimSchema>;

// Report Schema
export const reportSchema = z.object({
  item_id: z.string().uuid(),
  reason: z.enum(['fake', 'spam', 'duplicate', 'fraud', 'inappropriate', 'other']),
  description: z.string().max(500).optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;

// Search Schema
export const searchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['lost', 'found']).optional(),
  categories: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  status: z.array(z.enum(['draft', 'active', 'pending_claim', 'claimed', 'recovered', 'archived'])).optional(),
  reward_min: z.number().min(0).optional(),
  reward_max: z.number().max(1000000).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(1).max(500).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'closest', 'reward_high', 'reward_low', 'relevance', 'views']).default('newest'),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(5).max(100).default(20),
});

export type SearchFormData = z.infer<typeof searchSchema>;

// Ownership Questionnaire
export const ownershipQuestionnaireSchema = z.object({
  where_did_you_get_it: z.string().min(10, 'Answer must be at least 10 characters').max(500),
  when_did_you_get_it: z.string().min(4, 'Please provide approximate date').max(100),
  distinguishing_features: z.string().max(500).optional(),
  additional_proof: z.string().max(500).optional(),
});

export type OwnershipQuestionnaireData = z.infer<typeof ownershipQuestionnaireSchema>;
