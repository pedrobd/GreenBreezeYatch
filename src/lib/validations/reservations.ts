import { z } from "zod";

export const reservationSchema = z.object({
    client_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    client_email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    client_phone: z.string().min(9, "Telefone inválido").optional().or(z.literal("")),
    client_nif: z.string().optional().or(z.literal("")),
    boat_id: z.string().min(1, "Selecione um barco"),
    date: z.string().min(1, "Selecione uma data"),
    time: z.string().optional().or(z.literal("")),
    program_id: z.string().optional().or(z.literal("")),
    season_applied: z.string().optional(),
    subtotal_amount: z.coerce.number().min(0).default(0),
    extras_amount: z.coerce.number().min(0).default(0),
    vat_base_amount: z.coerce.number().min(0).default(0),
    vat_extras_amount: z.coerce.number().min(0).default(0),
    status: z.enum(["Pendente", "Confirmado", "Cancelado"]),
    total_amount: z.coerce.number().min(0).default(0),
    notes: z.string().optional().or(z.literal("")),
    skipper_id: z.string().optional().or(z.literal("")),
    marinheiro_id: z.string().optional().or(z.literal("")),
    extra_hours: z.coerce.number().min(0).optional().default(0),
    selected_activities: z.array(z.object({
        id: z.string(),
        quantity: z.number().min(1)
    })).optional().default([]),
    selected_food: z.array(z.object({
        id: z.string(),
        quantity: z.number().min(1)
    })).optional().default([]),
    boarding_location: z.string().min(1, "Local de embarque é obrigatório").default("Mitrena"),
    passengers_adults: z.coerce.number().min(1, "Pelo menos 1 adulto").default(1),
    passengers_children: z.coerce.number().min(0).default(0),
    client_address: z.string().optional().or(z.literal("")),
    client_country: z.string().optional().or(z.literal("")).default("Portugal"),
    payment_method: z.string().optional().or(z.literal("")),
    payment_status: z.string().optional().or(z.literal("")),
    sibs_reference: z.string().optional().or(z.literal("")),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;
