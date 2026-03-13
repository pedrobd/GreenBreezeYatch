"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { activitySchema, ActivityFormValues } from "@/lib/validations/activities";
import { revalidatePath } from "next/cache";

export async function createActivityAction(values: ActivityFormValues) {
    const validatedFields = activitySchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("extra_activities").insert([validatedFields.data]);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao criar atividade." };
    }

    revalidatePath("/activities");
    return { success: true };
}

export async function updateActivityAction(id: string, values: ActivityFormValues) {
    const validatedFields = activitySchema.safeParse(values);

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
        .from("extra_activities")
        .update(validatedFields.data)
        .eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao atualizar atividade." };
    }

    revalidatePath("/activities");
    return { success: true };
}

export async function deleteActivityAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("extra_activities").delete().eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao eliminar atividade." };
    }

    revalidatePath("/activities");
    return { success: true };
}
