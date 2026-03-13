"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "./auth";

export async function getTeamMembers() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("team_members")
        .select(`
            *,
            profile:user_id (
                role,
                full_name
            )
        `)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching team members:", error);
        return { error: "Erro ao carregar equipa." };
    }

    return { team: data };
}

export async function createTeamMember(formData: FormData) {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        return { error: "Apenas administradores podem gerir a equipa." };
    }

    const name = formData.get("name") as string;
    const role = formData.get("role") as "skipper" | "marinheiro";
    let userId = formData.get("userId") as string | null;
    const nif = formData.get("nif") as string | null;
    const billingAddress = formData.get("billingAddress") as string | null;
    const rateSunset = formData.get("rateSunset") ? parseFloat(formData.get("rateSunset") as string) : null;
    const rateHalfDay = formData.get("rateHalfDay") ? parseFloat(formData.get("rateHalfDay") as string) : null;
    const rate6hour = formData.get("rate6hour") ? parseFloat(formData.get("rate6hour") as string) : null;
    const rateFullDay = formData.get("rateFullDay") ? parseFloat(formData.get("rateFullDay") as string) : null;
    const rateExtraHour = formData.get("rateExtraHour") ? parseFloat(formData.get("rateExtraHour") as string) : null;

    if (userId === "none" || userId === "") {
        userId = null;
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("team_members")
        .insert({
            name,
            role,
            user_id: userId || null,
            nif,
            billing_address: billingAddress,
            rate_sunset: rateSunset,
            rate_half_day: rateHalfDay,
            rate_6hour: rate6hour,
            rate_full_day: rateFullDay,
            rate_extra_hour: rateExtraHour
        });

    if (error) {
        console.error("Error creating team member:", error);
        return { error: `Erro: ${error.message}` };
    }

    revalidatePath("/team");
    return { success: true };
}

export async function updateTeamMember(id: string, formData: FormData) {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        return { error: "Apenas administradores podem gerir a equipa." };
    }

    const name = formData.get("name") as string;
    const role = formData.get("role") as "skipper" | "marinheiro";
    let userId = formData.get("userId") as string | null;
    const nif = formData.get("nif") as string | null;
    const billingAddress = formData.get("billingAddress") as string | null;
    const rateSunset = formData.get("rateSunset") ? parseFloat(formData.get("rateSunset") as string) : null;
    const rateHalfDay = formData.get("rateHalfDay") ? parseFloat(formData.get("rateHalfDay") as string) : null;
    const rate6hour = formData.get("rate6hour") ? parseFloat(formData.get("rate6hour") as string) : null;
    const rateFullDay = formData.get("rateFullDay") ? parseFloat(formData.get("rateFullDay") as string) : null;
    const rateExtraHour = formData.get("rateExtraHour") ? parseFloat(formData.get("rateExtraHour") as string) : null;

    if (userId === "none" || userId === "") {
        userId = null;
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("team_members")
        .update({
            name,
            role,
            user_id: userId || null,
            nif,
            billing_address: billingAddress,
            rate_sunset: rateSunset,
            rate_half_day: rateHalfDay,
            rate_6hour: rate6hour,
            rate_full_day: rateFullDay,
            rate_extra_hour: rateExtraHour
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating team member:", error);
        return { error: `Erro: ${error.message}` };
    }

    revalidatePath("/team");
    return { success: true };
}

export async function deleteTeamMember(id: string) {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        return { error: "Apenas administradores podem gerir a equipa." };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting team member:", error);
        return { error: "Erro ao remover membro da equipa." };
    }

    revalidatePath("/team");
    return { success: true };
}
