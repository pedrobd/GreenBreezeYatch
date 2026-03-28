import { z } from "zod";

export const boatSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    type: z.string().min(2, "O tipo deve ter pelo menos 2 caracteres"),
    capacity: z.number().min(1, "A capacidade deve ser pelo menos 1"),
    current_location: z.string().min(1, "A localização é obrigatória"),
    setubal_surcharge: z.number().min(0, "A taxa deve ser pelo menos 0"),
    status: z.enum(["Disponível", "Manutenção", "Indisponível"]),
    base_price: z.number().min(0, "O preço base deve ser pelo menos 0").optional(),
    image_url: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    is_partner: z.boolean().optional(),
    description: z.string().optional(),
    inclusions: z.string().optional(),
    order_index: z.number().optional(),
});

export type BoatFormValues = z.infer<typeof boatSchema>;

export const boatProgramSchema = z.object({
    id: z.string().optional(),
    boat_id: z.string(),
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    duration_hours: z.coerce.number().min(0.5, "A duração deve ser pelo menos 0.5h").optional().default(4),
    price_low: z.coerce.number().min(0, "O preço deve ser pelo menos 0"),
    price_mid: z.coerce.number().min(0, "O preço deve ser pelo menos 0"),
    price_high: z.coerce.number().min(0, "O preço deve ser pelo menos 0"),
    vat_rate: z.coerce.number().default(6),
    is_active: z.boolean().default(true),
});

export const boatExtraSchema = z.object({
    id: z.string().optional(),
    boat_id: z.string(),
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    price: z.coerce.number().min(0, "O preço deve ser pelo menos 0"),
    vat_rate: z.coerce.number().default(23),
    pricing_type: z.enum(["per_booking", "per_person"]).default("per_booking"),
    description: z.string().optional(),
    image_url: z.string().optional(),
    show_in_frontoffice: z.boolean().default(true),
    is_active: z.boolean().default(true),
});
