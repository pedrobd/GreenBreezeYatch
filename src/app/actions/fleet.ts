"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { boatSchema, BoatFormValues, boatProgramSchema, boatExtraSchema } from "@/lib/validations/fleet";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function createBoatAction(values: BoatFormValues) {
    const validatedFields = boatSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("fleet").insert([validatedFields.data]);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao criar embarcação." };
    }

    revalidatePath("/fleet");
    return { success: true };
}

export async function updateBoatAction(id: string, values: BoatFormValues) {
    const validatedFields = boatSchema.safeParse(values);

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
        .from("fleet")
        .update(validatedFields.data)
        .eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao atualizar embarcação." };
    }

    revalidatePath("/fleet");
    return { success: true };
}

export async function deleteBoatAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("fleet").delete().eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: "Erro ao eliminar embarcação." };
    }

    revalidatePath("/fleet");
    return { success: true };
}

// ============== BOAT PROGRAMS ==============

export async function createBoatProgramAction(values: z.infer<typeof boatProgramSchema>) {
    const validatedFields = boatProgramSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("boat_programs").insert([validatedFields.data]);
    if (error) return { error: error.message || "Erro ao criar programa." };

    revalidatePath("/fleet");
    return { success: true };
}

export async function updateBoatProgramAction(id: string, values: z.infer<typeof boatProgramSchema>) {
    const validatedFields = boatProgramSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("boat_programs").update(validatedFields.data).eq("id", id);
    if (error) return { error: error.message || "Erro ao atualizar programa." };

    revalidatePath("/fleet");
    return { success: true };
}

export async function deleteBoatProgramAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("boat_programs").delete().eq("id", id);
    if (error) return { error: "Erro ao eliminar programa." };

    revalidatePath("/fleet");
    return { success: true };
}

export async function getBoatProgramsAction(boatId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("boat_programs").select("*").eq("boat_id", boatId).order("duration_hours");
    if (error) return { error: error.message };
    return { data };
}

// ============== BOAT EXTRAS ==============

export async function createBoatExtraAction(values: z.infer<typeof boatExtraSchema>) {
    const validatedFields = boatExtraSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("boat_extras").insert([validatedFields.data]);
    if (error) return { error: error.message || "Erro ao criar extra." };

    revalidatePath("/fleet");
    return { success: true };
}

export async function updateBoatExtraAction(id: string, values: z.infer<typeof boatExtraSchema>) {
    const validatedFields = boatExtraSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("boat_extras").update(validatedFields.data).eq("id", id);
    if (error) return { error: error.message || "Erro ao atualizar extra." };

    revalidatePath("/fleet");
    return { success: true };
}

export async function deleteBoatExtraAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autorizado." };

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("boat_extras").delete().eq("id", id);
    if (error) return { error: "Erro ao eliminar extra." };

    revalidatePath("/fleet");
    return { success: true };
}

export async function getBoatExtrasAction(boatId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("boat_extras").select("*").eq("boat_id", boatId).order("name");
    if (error) return { error: error.message };
    return { data };
}
