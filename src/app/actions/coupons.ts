"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { couponSchema, CouponFormValues } from "@/lib/validations/coupons";
import { revalidatePath } from "next/cache";

export async function getCouponsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

export async function createCouponAction(values: CouponFormValues) {
    const validatedFields = couponSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { id, ...insertData } = validatedFields.data;
    const { error } = await adminClient.from("coupons").insert([insertData]);

    if (error) return { error: error.message || "Erro ao criar cupão." };

    revalidatePath("/coupons");
    return { success: true };
}

export async function updateCouponAction(id: string, values: CouponFormValues) {
    const validatedFields = couponSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { id: _id, ...updateData } = validatedFields.data;
    const { error } = await adminClient.from("coupons").update(updateData).eq("id", id);

    if (error) return { error: error.message || "Erro ao atualizar cupão." };

    revalidatePath("/coupons");
    return { success: true };
}

export async function deleteCouponAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("coupons").delete().eq("id", id);

    if (error) return { error: "Erro ao eliminar cupão." };

    revalidatePath("/coupons");
    return { success: true };
}
