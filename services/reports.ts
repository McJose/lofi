import { supabase } from '@/lib/supabase';
import type { Report } from '@/types/items';
import type { ReportFormData } from '@/validation/items';

export async function createReport(
  userId: string | null,
  data: ReportFormData
): Promise<{ report: Report | null; error?: string }> {
  // Check if user already reported this item
  if (userId) {
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('item_id', data.item_id)
      .eq('reporter_id', userId)
      .maybeSingle();

    if (existing) {
      return { report: null, error: 'You have already reported this item' };
    }
  }

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      item_id: data.item_id,
      reporter_id: userId,
      reason: data.reason,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) {
    return { report: null, error: error.message };
  }

  // Notify moderators/admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('user_id')
    .gte('reputation_score', 100);

  if (admins && admins.length > 0) {
    await supabase.from('notifications').insert(
      admins.map((admin) => ({
        user_id: admin.user_id,
        type: 'warning',
        title: 'New Report Submitted',
        message: `A ${data.reason} report has been submitted for review.`,
        action_url: '/admin/reports',
      }))
    );
  }

  return { report: report as Report };
}

export async function getPendingReports(): Promise<{ reports: Array<Report & { item?: Record<string, unknown>; reporter?: Record<string, unknown> }>; error?: string }> {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      *,
      items (
        id,
        title,
        user_id,
        status
      ),
      profiles!reports_reporter_id_fkey (
        user_id,
        username,
        full_name
      )
    `
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    return { reports: [], error: error.message };
  }

  return {
    reports: (data || []).map((report) => ({
      ...report,
      item: report.items,
      reporter: report.profiles,
    })),
  };
}

export async function reviewReport(
  reportId: string,
  reviewerId: string,
  action: 'resolved' | 'dismissed',
  notes?: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('reports')
    .update({
      status: action === 'resolved' ? 'resolved' : 'dismissed',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      resolution_notes: notes || null,
    })
    .eq('id', reportId);

  if (error) {
    return { error: error.message };
  }

  // If resolved, potentially take action on item
  if (action === 'resolved') {
    const { data: report } = await supabase
      .from('reports')
      .select('item_id, reason')
      .eq('id', reportId)
      .single();

    if (report && report.reason === 'fake') {
      await supabase.from('items').update({ status: 'archived' }).eq('id', report.item_id);
    }
  }

  return {};
}

export async function getUserReports(userId: string): Promise<{ reports: Report[]; error?: string }> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { reports: [], error: error.message };
  }

  return { reports: (data || []) as Report[] };
}
