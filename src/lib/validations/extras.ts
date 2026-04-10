import { z } from "zod";

export const extraSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    price: z.coerce.number().min(0, "O preço deve ser pelo menos 0"),
    vat_rate: z.coerce.number().default(23),
    pricing_type: z.enum(["per_booking", "per_person"]).default("per_booking"),
    duration: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    image_url: z.string().optional().or(z.literal("")),
    show_in_frontoffice: z.boolean().default(true),
    is_active: z.boolean().default(true),
    category: z.enum(["aluguer", "aula"]).default("aluguer"),
    quantity: z.coerce.number().min(0, "A quantidade deve ser pelo menos 0").default(1),
    sort_order: z.coerce.number().default(0),
});

export type ExtraFormValues = z.infer<typeof extraSchema>;
