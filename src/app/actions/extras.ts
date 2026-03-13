"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { extraSchema, ExtraFormValues } from "@/lib/validations/extras";
import { revalidatePath } from "next/cache";

export async function getExtrasAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("extras")
        .select("*")
        .order("name");

    if (error) return { error: error.message };
    return { data };
}

export async function createExtraAction(values: ExtraFormValues) {
    const validatedFields = extraSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { id, ...insertData } = validatedFields.data;
    const { error } = await adminClient.from("extras").insert([insertData]);

    if (error) return { error: error.message || "Erro ao criar extra." };

    revalidatePath("/extras");
    return { success: true };
}

export async function updateExtraAction(id: string, values: ExtraFormValues) {
    const validatedFields = extraSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { id: _id, ...updateData } = validatedFields.data;
    const { error } = await adminClient.from("extras").update(updateData).eq("id", id);

    if (error) return { error: error.message || "Erro ao atualizar extra." };

    revalidatePath("/extras");
    return { success: true };
}

export async function deleteExtraAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("extras").delete().eq("id", id);

    if (error) return { error: "Erro ao eliminar extra." };

    revalidatePath("/extras");
    return { success: true };
}
