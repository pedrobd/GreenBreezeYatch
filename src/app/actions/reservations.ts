"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { reservationSchema, ReservationFormValues } from "@/lib/validations/reservations";
import { revalidatePath } from "next/cache";
import { sendReservationEmails, sendCancellationEmail } from "@/app/actions/emails";

/** Local type that reflects the DB shape (nullable FKs + optional time). */
type ReservationData = Omit<ReservationFormValues, "selected_activities" | "selected_food" | "skipper_id" | "marinheiro_id" | "program_id"> & {
    time?: string;
    skipper_id?: string | null;
    marinheiro_id?: string | null;
    program_id?: string | null;
};

/** Booking conflict row returned by the availability check. */
interface BookingSlot {
    time?: string | null;
}

export async function getExtraActivitiesAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("extra_activities").select("*").order("name");
    if (error) return { error: error.message };
    return { data };
}

export async function getFoodMenuAction() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("food_menu").select("*").order("name");
    if (error) return { error: error.message };
    return { data };
}

export async function createReservationAction(values: ReservationFormValues) {
    const validatedFields = reservationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { selected_activities, selected_food, ...reservationData } = validatedFields.data;

    const data: ReservationData = { ...reservationData };

    // Normalize empty FK strings to null (DB expects null for unset FKs)
    if (!data.skipper_id || data.skipper_id === "none") data.skipper_id = null;
    if (!data.marinheiro_id || data.marinheiro_id === "none") data.marinheiro_id = null;
    if (!data.program_id) data.program_id = null;

    if (data.program_id) {
        const { data: prog } = await adminClient.from("boat_programs").select("name").eq("id", data.program_id).single();
        if (!data.time || data.time === "") {
            data.time = prog?.name || "Custom";
        }
    } else if (!data.time || data.time === "") {
        data.time = "Custom";
    }

    if (data.status !== "Cancelado") {
        const { data: existing } = await adminClient
            .from("reservations")
            .select("time")
            .eq("boat_id", data.boat_id)
            .eq("date", data.date)
            .neq("status", "Cancelado");

        if (existing && existing.length > 0) {
            const timeStr = data.time ?? "";
            const newTime = timeStr.toLowerCase().trim();
            const isNewFullDay = newTime.includes('1 dia') || newTime.includes('dia todo') || newTime.includes('dia inteiro');

            const hasExistingFullDay = (existing as BookingSlot[]).some(r =>
                r.time && (r.time.toLowerCase().includes('1 dia') || r.time.toLowerCase().includes('dia todo') || r.time.toLowerCase().includes('dia inteiro'))
            );

            if (hasExistingFullDay) {
                return { error: "O barco já está reservado para o dia inteiro nesta data." };
            }

            if (isNewFullDay && existing.length > 0) {
                return { error: "Já existem reservas neste barco para esta data. Não é possível reservar o dia inteiro." };
            }

            const exactMatches = (existing as BookingSlot[]).filter(r => r.time && r.time.toLowerCase().trim() === newTime);

            if (exactMatches.length > 0) {
                if (newTime === '1/2 dia' && exactMatches.length === 1) {
                    if (existing.length >= 2) {
                        return { error: "O barco já atingiu o limite de reservas parciais para esta data." };
                    }
                } else {
                    return { error: `Já existe uma reserva para o horário selecionado ("${timeStr}") nesta data.` };
                }
            }
        }
    }

    const { data: res, error } = await adminClient.from("reservations").insert([data]).select().single();

    if (error) {
        console.error("Supabase error creating reservation:", error);
        return { error: error.message || "Erro ao criar reserva." };
    }

    if (selected_activities && selected_activities.length > 0) {
        const activitiesToInsert = selected_activities.map(a => ({
            reservation_id: res.id,
            activity_id: a.id,
            quantity: a.quantity
        }));
        await adminClient.from("reservation_activities").insert(activitiesToInsert);
    }

    if (selected_food && selected_food.length > 0) {
        const foodToInsert = selected_food.map(f => ({
            reservation_id: res.id,
            food_id: f.id,
            quantity: f.quantity
        }));
        await adminClient.from("reservation_food").insert(foodToInsert);
    }

    try {
        const { data: boat } = await adminClient.from("fleet").select("name").eq("id", data.boat_id).single();
        let programName = "Programa Custom";
        if (data.program_id) {
            const { data: prog } = await adminClient.from("boat_programs").select("name").eq("id", data.program_id).single();
            if (prog) programName = prog.name;
        }

        await sendReservationEmails({
            id: res.id,
            client_name: res.client_name,
            client_email: res.client_email,
            date: res.date,
            boat_name: boat?.name || "Barco GreenBreeze",
            program_name: programName,
            total_amount: res.total_amount,
            skipper_id: res.skipper_id,
            marinheiro_id: res.marinheiro_id,
        });
    } catch (emailError) {
        console.error("Non-blocking email error:", emailError);
    }

    revalidatePath("/reservations");
    return { success: true };
}

export async function updateReservationAction(id: string, values: ReservationFormValues) {
    const validatedFields = reservationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const { selected_activities, selected_food, ...reservationData } = validatedFields.data;
    const data: ReservationData = { ...reservationData };

    if (!data.skipper_id || data.skipper_id === "none") data.skipper_id = null;
    if (!data.marinheiro_id || data.marinheiro_id === "none") data.marinheiro_id = null;
    if (!data.program_id) data.program_id = null;

    const adminClient = createAdminClient();

    if (data.program_id) {
        const { data: prog } = await adminClient.from("boat_programs").select("name").eq("id", data.program_id).single();
        if (!data.time || data.time === "") {
            data.time = prog?.name || "Custom";
        }
    } else if (!data.time || data.time === "") {
        data.time = "Custom";
    }

    if (data.status !== "Cancelado") {
        const { data: existing } = await adminClient
            .from("reservations")
            .select("id, time")
            .eq("boat_id", data.boat_id)
            .eq("date", data.date)
            .neq("status", "Cancelado")
            .neq("id", id);

        if (existing && existing.length > 0) {
            const timeStr = data.time ?? "";
            const newTime = timeStr.toLowerCase().trim();
            const isNewFullDay = newTime.includes('1 dia') || newTime.includes('dia todo') || newTime.includes('dia inteiro');

            const hasExistingFullDay = (existing as BookingSlot[]).some(r =>
                r.time && (r.time.toLowerCase().includes('1 dia') || r.time.toLowerCase().includes('dia todo') || r.time.toLowerCase().includes('dia inteiro'))
            );

            if (hasExistingFullDay) {
                return { error: "O barco já está reservado para o dia inteiro nesta data." };
            }

            if (isNewFullDay && existing.length > 0) {
                return { error: "Já existem reservas neste barco para esta data. Não é possível reservar o dia inteiro." };
            }

            const exactMatches = (existing as BookingSlot[]).filter(r => r.time && r.time.toLowerCase().trim() === newTime);

            if (exactMatches.length > 0) {
                if (newTime === '1/2 dia' && exactMatches.length === 1) {
                    if (existing.length >= 2) {
                        return { error: "O barco já atingiu o limite de reservas parciais para esta data." };
                    }
                } else {
                    return { error: `Já existe uma reserva para o horário selecionado ("${timeStr}") nesta data.` };
                }
            }
        }
    }

    const { error } = await adminClient
        .from("reservations")
        .update(data)
        .eq("id", id);

    if (error) {
        console.error("Supabase error updating reservation:", error);
        return { error: error.message || "Erro ao atualizar reserva." };
    }

    await adminClient.from("reservation_activities").delete().eq("reservation_id", id);
    if (selected_activities && selected_activities.length > 0) {
        const activitiesToInsert = selected_activities.map(a => ({
            reservation_id: id,
            activity_id: a.id,
            quantity: a.quantity
        }));
        await adminClient.from("reservation_activities").insert(activitiesToInsert);
    }

    await adminClient.from("reservation_food").delete().eq("reservation_id", id);
    if (selected_food && selected_food.length > 0) {
        const foodToInsert = selected_food.map(f => ({
            reservation_id: id,
            food_id: f.id,
            quantity: f.quantity
        }));
        await adminClient.from("reservation_food").insert(foodToInsert);
    }

    revalidatePath("/reservations");
    return { success: true };
}

export async function deleteReservationAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("reservations").delete().eq("id", id);

    if (error) {
        console.error("Supabase error deleting reservation:", error);
        return { error: error.message || "Erro ao eliminar reserva." };
    }

    revalidatePath("/reservations");
    return { success: true };
}

export async function cancelReservationAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();

    // 1. Fetch data before update
    const { data: res, error: fetchError } = await adminClient
        .from("reservations")
        .select(`
            id,
            client_name,
            client_email,
            date,
            boat_id
        `)
        .eq("id", id)
        .single();

    if (fetchError) {
        console.error("Fetch error before cancellation:", fetchError);
    }

    // Update status
    const { error: updateError } = await adminClient
        .from("reservations")
        .update({ status: "Cancelado" })
        .eq("id", id);

    if (updateError) {
        console.error("Supabase error cancelling reservation:", updateError);
        return { error: updateError.message || "Erro ao cancelar reserva." };
    }

    // 2. Send cancellation email synchronously
    if (res) {
        try {
            // Optional: Get boat name separately to avoid join issues
            const { data: boat } = await adminClient.from("fleet").select("name").eq("id", res.boat_id).single();
            
            await sendCancellationEmail({
                id: res.id,
                client_name: res.client_name,
                client_email: res.client_email,
                date: res.date,
                boat_name: boat?.name || "Barco GreenBreeze"
            });
        } catch (emailError) {
            console.error("Error sending cancellation email:", emailError);
        }
    } else {
        console.warn("Could not find reservation data to send cancellation email.");
    }

    revalidatePath("/reservations");
    return { success: true };
}

export async function getReservationDatesAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("reservations")
        .select("date")
        .neq("status", "Cancelado");

    if (error) {
        console.error("Supabase error fetching reservation dates:", error);
        return { error: error.message || "Erro ao buscar datas de reserva." };
    }

    const dates = data.map(d => d.date);
    return { data: dates };
}

