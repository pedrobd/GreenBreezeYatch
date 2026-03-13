"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { reservationSchema, ReservationFormValues } from "@/lib/validations/reservations";
import { revalidatePath } from "next/cache";
import { sendReservationEmails } from "@/app/actions/emails";
import { initiateSibsPayment } from "@/utils/sibs";

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
    const { selected_activities, selected_food, sibs_reference, ...reservationData } = validatedFields.data;

    const data = { ...reservationData };

    if (data.skipper_id === "" || data.skipper_id === "none") data.skipper_id = null as any;
    if (data.marinheiro_id === "" || data.marinheiro_id === "none") data.marinheiro_id = null as any;
    if (data.program_id === "") data.program_id = null as any;

    if (data.program_id) {
        const { data: prog } = await adminClient.from("boat_programs").select("name").eq("id", data.program_id).single();
        (data as any).time = prog?.name || "Custom";
    } else {
        (data as any).time = "Custom";
    }

    if (data.status !== "Cancelado") {
        const { data: existing } = await adminClient
            .from("reservations")
            .select("time")
            .eq("boat_id", data.boat_id)
            .eq("date", data.date)
            .neq("status", "Cancelado");

        if (existing && existing.length > 0) {
            const timeStr = (data as any).time;
            const newTime = timeStr.toLowerCase().trim();
            const isNewFullDay = newTime.includes('1 dia') || newTime.includes('dia todo') || newTime.includes('dia inteiro');
            
            const hasExistingFullDay = existing.some((r: any) => 
                r.time && (r.time.toLowerCase().includes('1 dia') || r.time.toLowerCase().includes('dia todo') || r.time.toLowerCase().includes('dia inteiro'))
            );

            if (hasExistingFullDay) {
                return { error: "O barco já está reservado para o dia inteiro nesta data." };
            }
            
            if (isNewFullDay && existing.length > 0) {
                return { error: "Já existem reservas neste barco para esta data. Não é possível reservar o dia inteiro." };
            }

            const exactMatches = existing.filter((r: any) => r.time && r.time.toLowerCase().trim() === newTime);
            
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

    // Insert extras into junction tables
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
    // Send confirmation emails
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

    const { selected_activities, selected_food, sibs_reference, ...reservationData } = validatedFields.data;
    const data = { ...reservationData };
    if (data.skipper_id === "" || data.skipper_id === "none") data.skipper_id = null as any;
    if (data.marinheiro_id === "" || data.marinheiro_id === "none") data.marinheiro_id = null as any;
    if (data.program_id === "") data.program_id = null as any;

    const adminClient = createAdminClient();

    if (data.program_id) {
        const { data: prog } = await adminClient.from("boat_programs").select("name").eq("id", data.program_id).single();
        (data as any).time = prog?.name || "Custom";
    } else {
        (data as any).time = "Custom";
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
            const timeStr = (data as any).time;
            const newTime = timeStr.toLowerCase().trim();
            const isNewFullDay = newTime.includes('1 dia') || newTime.includes('dia todo') || newTime.includes('dia inteiro');
            
            const hasExistingFullDay = existing.some((r: any) => 
                r.time && (r.time.toLowerCase().includes('1 dia') || r.time.toLowerCase().includes('dia todo') || r.time.toLowerCase().includes('dia inteiro'))
            );

            if (hasExistingFullDay) {
                return { error: "O barco já está reservado para o dia inteiro nesta data." };
            }
            
            if (isNewFullDay && existing.length > 0) {
                return { error: "Já existem reservas neste barco para esta data. Não é possível reservar o dia inteiro." };
            }

            const exactMatches = existing.filter((r: any) => r.time && r.time.toLowerCase().trim() === newTime);
            
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

    // Sync extras: Delete existing and insert new
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

    const dates = data.map((d: any) => d.date);
    return { data: dates };
}

export async function initiateReservationPaymentAction(reservationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { data: reservation, error } = await adminClient
        .from("reservations")
        .select("*, fleet(name)")
        .eq("id", reservationId)
        .single();

    if (error || !reservation) {
        return { error: "Reserva não encontrada." };
    }

    const paymentResult = await initiateSibsPayment({
        amount: reservation.total_amount,
        currency: "EUR",
        merchantReference: reservation.id,
        description: `Reserva GreenBreeze - ${reservation.fleet?.name || 'Barco'} - ${reservation.date}`,
        returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reservations?payment=success`,
    });

    if (!paymentResult.success) {
        return { error: paymentResult.error || "Erro ao iniciar pagamento SIBS." };
    }

    // Update reservation with SIBS payment ID (sibs_reference)
    await adminClient
        .from("reservations")
        .update({ sibs_reference: paymentResult.paymentId })
        .eq("id", reservationId);

    return { success: true, redirectUrl: paymentResult.redirectUrl };
}
