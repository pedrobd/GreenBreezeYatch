"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { systemSettingsSchema, SystemSettingsFormValues } from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";

export async function getSystemSettingsAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "settings")
        .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is 'no rows returned'
        console.error("Error fetching settings:", error);
    }

    return { settings: data || null };
}

export async function updateSystemSettingsAction(values: SystemSettingsFormValues) {
    const validatedFields = systemSettingsSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("system_settings")
        .upsert({
            id: "settings",
            ...validatedFields.data,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Supabase error updating settings:", error);
        return { error: error.message || "Erro ao atualizar configurações." };
    }

    revalidatePath("/settings");
    return { success: true };
}
