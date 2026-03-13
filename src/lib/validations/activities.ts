import { z } from "zod";

export interface ActivityFormValues {
    name: string;
    type: string;
    price: number | string;
    status: "Disponível" | "Esgotado" | "Indisponível Temporariamente";
    stock: number | string;
    availability: string;
}

export const activitySchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    type: z.string().min(2, "O tipo deve ter pelo menos 2 caracteres"),
    price: z.coerce.number().min(0, "O preço deve ser pelo menos 0"),
    status: z.enum(["Disponível", "Esgotado", "Indisponível Temporariamente"]),
    stock: z.coerce.number().min(0, "O stock deve ser pelo menos 0"),
    availability: z.string().min(2, "A disponibilidade deve ser especificada"),
});
