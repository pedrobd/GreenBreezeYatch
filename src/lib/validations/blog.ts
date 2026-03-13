import { z } from "zod";

export interface BlogPostFormValues {
    title: string;
    slug: string;
    content: string;
    author: string;
    publish_date?: string | null;
    status: "Rascunho" | "Publicado" | "Agendado";
    category: string;
    cover_image_url?: string;
}

export const blogPostSchema = z.object({
    title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
    slug: z.string().min(5, "O slug deve ter pelo menos 5 caracteres").regex(/^[a-z0-9-]+$/, "Slug inválido (apenas letras minúsculas, números e hífens)"),
    content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres"),
    author: z.string().min(2, "O autor deve ser identificado"),
    publish_date: z.string().nullable().optional(),
    status: z.enum(["Rascunho", "Publicado", "Agendado"]),
    category: z.string().min(2, "Selecione uma categoria"),
    cover_image_url: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});
