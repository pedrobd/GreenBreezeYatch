"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "./auth";

export async function getProfiles() {
    const { user, error: authError } = await getUserProfile();

    if (authError || user?.role !== "admin") {
        return { error: "Não autorizado." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching profiles:", error);
        return { error: "Erro ao carregar utilizadores." };
    }

    return { profiles: data };
}

export async function createSystemUser(formData: FormData) {
    const { user: currentUser, error: authError } = await getUserProfile();

    if (authError || currentUser?.role !== "admin") {
        return { error: "Apenas administradores podem criar utilizadores." };
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as "admin" | "booking_manager" | "skipper" | "marinheiro";

    const adminClient = await createAdminClient();

    // 1. Create Auth User
    const { data: authData, error: authErrorMsg } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    });

    if (authErrorMsg) {
        console.error("Error creating auth user:", authErrorMsg);
        return { error: `Erro ao criar conta: ${authErrorMsg.message}` };
    }

    // 2. Create Profile
    const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
            id: authData.user.id,
            role,
            full_name: fullName
        });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        return { error: "Conta criada, mas erro ao definir perfil/cargo." };
    }

    revalidatePath("/users");
    return { success: true };
}

export async function updateSystemUserRole(id: string, role: string) {
    const { user: currentUser, error: authError } = await getUserProfile();

    if (authError || currentUser?.role !== "admin") {
        return { error: "Não autorizado." };
    }

    const supabase = await createAdminClient();
    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);

    if (error) {
        return { error: "Erro ao atualizar cargo." };
    }

    revalidatePath("/users");
    return { success: true };
}

export async function updateSystemUserProfile(
    id: string, 
    payload: { fullName: string; role: "admin" | "booking_manager" | "skipper" | "marinheiro"; password?: string; email?: string }
) {
    const { user: currentUser, error: authError } = await getUserProfile();

    if (authError || currentUser?.role !== "admin") {
        return { error: "Apenas administradores podem editar utilizadores." };
    }

    const { fullName, role, password, email } = payload;

    const adminClient = await createAdminClient();

    // Update Profile (Name and Role)
    const { error: profileError } = await adminClient
        .from("profiles")
        .update({
            role,
            full_name: fullName
        })
        .eq("id", id);

    if (profileError) {
        console.error("Error updating profile:", profileError);
        return { error: "Erro ao atualizar perfil do utilizador." };
    }

    // Update Auth User credentials
    const updateData: any = {};
    if (password && password.length >= 8) updateData.password = password;
    if (email) {
        updateData.email = email;
        updateData.email_confirm = true;
    }

    if (Object.keys(updateData).length > 0) {
        // Check for email conflict before updating
        if (updateData.email) {
            const { data: existingUser } = await adminClient
                .from("profiles")
                .select("id")
                .eq("email", updateData.email)
                .single();

            // Note: In some systems email is in profiles, in others only in Auth.
            // If it's only in Auth, we can't easily check profiles. 
            // In your schema, profiles usually have an email copy for display.
        }

        const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(id, updateData);

        if (authUpdateError) {
            console.error("Auth update error:", authUpdateError);
            if (authUpdateError.message.includes("Email already exists") || authUpdateError.status === 422) {
                return { error: "Este email já está a ser utilizado por outro utilizador." };
            }
            return { error: `Perfil atualizado, mas erro ao mudar email/password: ${authUpdateError.message}` };
        }
    }

    revalidatePath("/users");
    return { success: true };
}

export async function deleteSystemUser(id: string) {
    const { user: currentUser, error: authError } = await getUserProfile();

    if (authError || currentUser?.role !== "admin") {
        return { error: "Não autorizado." };
    }

    const adminClient = await createAdminClient();

    // Auth user deletion automatically deletes profile due to CASCADE
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) {
        console.error("Error deleting user:", error);
        return { error: "Erro ao remover utilizador." };
    }

    revalidatePath("/users");
    return { success: true };
}
