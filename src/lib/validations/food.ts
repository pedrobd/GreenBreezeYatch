import { z } from "zod";

export interface FoodFormValues {
    name: string;
    category: string;
    description?: string | null;
    dietary_info?: string;
    stock: number | string;
    status: "Disponível" | "Esgotado" | "Indisponível";
    price: number | string;
    image_url?: string | null;
}

export const foodSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    category: z.string().min(1, "Categoria é obrigatória"),
    description: z.string().optional().nullable(),
    dietary_info: z.string().optional().default("Geral"),
    stock: z.union([z.string(), z.number()]).refine(val => Number(val) >= 0, "O stock deve ser pelo menos 0"),
    status: z.enum(["Disponível", "Esgotado", "Indisponível"]),
    price: z.union([z.string(), z.number()]).refine(val => Number(val) >= 0, "O preço deve ser pelo menos 0"),
    image_url: z.string().optional().nullable(),
});
