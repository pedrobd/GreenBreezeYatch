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
    
    // Dual write to both tables
    const { data: mainData, error: mainError } = await adminClient.from("extras").insert([insertData]).select("id").single();
    if (mainData) {
        await adminClient.from("extra_activities").upsert({
            id: mainData.id,
            name: insertData.name,
            price: insertData.price,
            type: "Global Extra"
        });
    }

    if (mainError) return { error: mainError.message || "Erro ao criar extra." };

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
    
    // Dual update
    const { error: mainError } = await adminClient.from("extras").update(updateData).eq("id", id);
    await adminClient.from("extra_activities").upsert({
        id,
        name: updateData.name,
        price: updateData.price,
        type: "Global Extra"
    });

    if (mainError) return { error: mainError.message || "Erro ao atualizar extra." };

    revalidatePath("/extras");
    return { success: true };
}

export async function deleteExtraAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error: mainError } = await adminClient.from("extras").delete().eq("id", id);
    await adminClient.from("extra_activities").delete().eq("id", id);

    if (mainError) return { error: "Erro ao eliminar extra." };

    revalidatePath("/extras");
    return { success: true };
}
