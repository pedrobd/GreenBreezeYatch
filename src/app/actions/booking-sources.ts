"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getBookingSourcesAction() {
  try {
    const { data, error } = await supabase
      .from('booking_sources')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createBookingSourceAction(payload: { type: string; name: string }) {
  try {
    const { data, error } = await supabase
      .from('booking_sources')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateBookingSourceAction(id: string, payload: { type?: string; name?: string; is_active?: boolean }) {
  try {
    const { data, error } = await supabase
      .from('booking_sources')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteBookingSourceAction(id: string) {
  try {
    const { error } = await supabase
      .from('booking_sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
