"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "./auth";

export async function getStaffRates() {
    const { user, error: authError } = await getUserProfile();

    if (authError || user?.role !== "admin") {
        return { error: "Não autorizado." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("staff_rates")
        .select("*")
        .order("staff_role", { ascending: true });

    if (error) {
        console.error("Error fetching staff rates:", error);
        return { error: "Erro ao carregar taxas." };
    }

    return { rates: data };
}

export async function updateStaffRate(id: string, updates: { base_value?: number; extra_hour_value?: number }) {
    const { user, error: authError } = await getUserProfile();

    if (authError || user?.role !== "admin") {
        return { error: "Não autorizado." };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("staff_rates")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("Error updating staff rate:", error);
        return { error: "Erro ao atualizar taxa." };
    }

    revalidatePath("/settings");
    return { success: true };
}
