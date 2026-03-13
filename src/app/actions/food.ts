"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { foodSchema, FoodFormValues } from "@/lib/validations/food";
import { revalidatePath } from "next/cache";

export async function createFoodAction(values: FoodFormValues) {
    const validatedFields = foodSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("food_menu").insert([validatedFields.data]);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao criar artigo no menu." };
    }

    revalidatePath("/food");
    return { success: true };
}

export async function updateFoodAction(id: string, values: FoodFormValues) {
    const validatedFields = foodSchema.safeParse(values);

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
        .from("food_menu")
        .update(validatedFields.data)
        .eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao atualizar artigo no menu." };
    }

    revalidatePath("/food");
    return { success: true };
}

export async function deleteFoodAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("food_menu").delete().eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao eliminar artigo no menu." };
    }

    revalidatePath("/food");
    return { success: true };
}

export async function reorderFoodAction(items: { id: string, sort_order: number }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    
    // Batch update (Supabase doesn't support easy batch update of different values, so we loop)
    // For productivity, we'll do them in parallel
    const promises = items.map(item => 
        adminClient
            .from("food_menu")
            .update({ sort_order: item.sort_order })
            .eq("id", item.id)
    );

    const results = await Promise.all(promises);
    const firstError = results.find(r => r.error);

    if (firstError) {
        console.error("Supabase reorder error:", firstError.error);
        return { error: "Erro ao reordenar alguns itens." };
    }

    revalidatePath("/food");
    return { success: true };
}
