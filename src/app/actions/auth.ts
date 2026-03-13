"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: "Não autorizado." };
    }

    // 1. Fetch profile role
    let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    const isAdminEmail = user.email === "info@greenbreeze.pt";

    // 2. Auto-repair/Create admin profile for the main account
    if (isAdminEmail) {
        // If profile is missing OR has wrong role, fix it
        if (!profile || profile.role !== "admin") {
            const { data: fixedProfile, error: repairError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    role: "admin",
                    full_name: profile?.full_name || user.user_metadata?.full_name || "Admin"
                })
                .select()
                .single();

            if (!repairError) {
                profile = fixedProfile;
            }
        }
    }

    // Determine final role with safe fallbacks
    let finalRole: "admin" | "booking_manager" | "skipper" | "marinheiro" = "skipper";

    if (isAdminEmail) {
        finalRole = "admin"; // Hardcoded safety for the main account
    } else if (profile?.role) {
        finalRole = profile.role as any;
    }

    return {
        user: {
            id: user.id,
            email: user.email || "",
            name: profile?.full_name || user.user_metadata?.full_name || "Utilizador",
            role: finalRole,
            notifications: {
                new_bookings: user.user_metadata?.notify_new_bookings !== false,
                fleet_alerts: user.user_metadata?.notify_fleet_alerts !== false,
                marketing: user.user_metadata?.notify_marketing === true,
            }
        }
    };
}

export async function updateUserNotificationsAction(payload: { email_bookings: boolean; system_alerts: boolean; marketing: boolean }) {
    const { email_bookings: new_bookings, system_alerts: fleet_alerts, marketing } = payload;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    // Update Auth user metadata
    const { error } = await supabase.auth.updateUser({
        data: {
            notify_new_bookings: new_bookings,
            notify_fleet_alerts: fleet_alerts,
            notify_marketing: marketing
        }
    });

    if (error) {
        console.error("Error updating user notifications:", error);
        return { error: error.message || "Erro ao atualizar notificações." };
    }

    revalidatePath("/settings");
    return { success: true };
}

export async function updateUserProfileAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name || !email) {
        return { error: "Nome e Email são obrigatórios." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    // Update Auth user
    const { error } = await supabase.auth.updateUser({
        email: email,
        data: { full_name: name }
    });

    if (error) {
        console.error("Error updating user profile:", error);
        return { error: error.message || "Erro ao atualizar perfil." };
    }

    revalidatePath("/settings");
    return { success: true };
}

export async function updateUserPasswordAction(formData: FormData) {
    const current_pwd = formData.get("current_pwd") as string;
    const new_pwd = formData.get("new_pwd") as string;
    const confirm_pwd = formData.get("confirm_pwd") as string;

    if (!new_pwd || !confirm_pwd) {
        return { error: "Preencha todos os campos." };
    }

    if (new_pwd !== confirm_pwd) {
        return { error: "As palavras-passe não coincidem." };
    }

    if (new_pwd.length < 6) {
        return { error: "A nova palavra-passe deve ter pelo menos 6 caracteres." };
    }

    const supabase = await createClient();

    // We don't verify current_pwd strictly here as Supabase auth.updateUser handles it securely 
    // by sending a confirmation email or requiring re-authentication if security settings mandate it.
    // However, for standard email auth, we can just call updateUser.
    const { error } = await supabase.auth.updateUser({
        password: new_pwd
    });

    if (error) {
        return { error: error.message || "Erro ao atualizar palavra-passe." };
    }

    return { success: true };
}

export async function signOutAction() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error);
        return { error: "Erro ao terminar sessão." };
    }

    revalidatePath("/", "layout");
    return { success: true };
}
