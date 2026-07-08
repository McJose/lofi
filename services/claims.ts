import { supabase } from '@/lib/supabase';
import type { Claim, ClaimWithRelations } from '@/types/items';
import type { ClaimFormData } from '@/validation/items';

export async function createClaim(
  userId: string,
  data: ClaimFormData
): Promise<{ claim: Claim | null; error?: string }> {
  // Check if user already has a pending claim
  const { data: existingClaim } = await supabase
    .from('claims')
    .select('id')
    .eq('item_id', data.item_id)
    .eq('claimer_id', userId)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingClaim) {
    return { claim: null, error: 'You already have a pending claim for this item' };
  }

  const { data: claim, error } = await supabase
    .from('claims')
    .insert({
      item_id: data.item_id,
      claimer_id: userId,
      message: data.message,
      proof_photos: JSON.stringify(data.proof_photos || []),
      proof_receipt_url: data.proof_receipt_url || null,
      serial_number_proof: data.serial_number_proof || null,
      questionnaire_answers: JSON.stringify(data.questionnaire_answers || {}),
    })
    .select()
    .single();

  if (error) {
    return { claim: null, error: error.message };
  }

  // Update item status
  await supabase
    .from('items')
    .update({ status: 'pending_claim' })
    .eq('id', data.item_id);

  // Notify item owner
  const { data: item } = await supabase
    .from('items')
    .select('user_id, title')
    .eq('id', data.item_id)
    .single();

  if (item) {
    await supabase.from('notifications').insert({
      user_id: item.user_id,
      type: 'info',
      title: 'New Claim Submitted',
      message: `Someone has claimed your item "${item.title}". Review the claim now.`,
      action_url: `/items/${data.item_id}/claims`,
    });
  }

  return { claim: claim as Claim };
}

export async function getClaimsForItem(itemId: string): Promise<{ claims: ClaimWithRelations[]; error?: string }> {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      profiles!claims_claimer_id_fkey (
        user_id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });

  if (error) {
    return { claims: [], error: error.message };
  }

  return {
    claims: (data || []).map((claim) => ({
      ...claim,
      claimer: claim.profiles,
    })) as ClaimWithRelations[],
  };
}

export async function getMyClaims(userId: string): Promise<{ claims: ClaimWithRelations[]; error?: string }> {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      items (
        id,
        title,
        type,
        photos,
        status
      )
    `)
    .eq('claimer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { claims: [], error: error.message };
  }

  return { claims: (data || []) as ClaimWithRelations[] };
}

export async function reviewClaim(
  claimId: string,
  itemId: string,
  reviewerId: string,
  approved: boolean,
  notes?: string
): Promise<{ error?: string }> {
  const status = approved ? 'approved' : 'rejected';

  const { error } = await supabase
    .from('claims')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      admin_notes: notes || null,
    })
    .eq('id', claimId);

  if (error) {
    return { error: error.message };
  }

  // Get claim details for notification
  const { data: claim } = await supabase
    .from('claims')
    .select('claimer_id')
    .eq('id', claimId)
    .single();

  if (claim) {
    // Update item status if approved
    if (approved) {
      await supabase.from('items').update({ status: 'claimed' }).eq('id', itemId);
    } else {
      // Reset to active if rejected
      await supabase.from('items').update({ status: 'active' }).eq('id', itemId);
    }

    // Notify claimer
    await supabase.from('notifications').insert({
      user_id: claim.claimer_id,
      type: approved ? 'success' : 'error',
      title: approved ? 'Claim Approved!' : 'Claim Rejected',
      message: approved
        ? 'Your claim has been approved. Contact the owner to arrange pickup.'
        : 'Your claim has been rejected. You may submit additional proof if needed.',
      action_url: `/items/${itemId}`,
    });
  }

  return {};
}

export async function updateClaim(
  claimId: string,
  userId: string,
  updates: Partial<ClaimFormData>
): Promise<{ claim: Claim | null; error?: string }> {
  const { data: claim, error } = await supabase
    .from('claims')
    .update({
      ...updates,
      proof_photos: updates.proof_photos ? JSON.stringify(updates.proof_photos) : undefined,
      questionnaire_answers: updates.questionnaire_answers
        ? JSON.stringify(updates.questionnaire_answers)
        : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', claimId)
    .eq('claimer_id', userId)
    .select()
    .single();

  if (error) {
    return { claim: null, error: error.message };
  }

  return { claim: claim as Claim };
}

export async function withdrawClaim(claimId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('claims')
    .delete()
    .eq('id', claimId)
    .eq('claimer_id', userId)
    .eq('status', 'pending');

  if (error) {
    return { error: error.message };
  }

  return {};
}
