"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { blogPostSchema, BlogPostFormValues } from "@/lib/validations/blog";
import { revalidatePath } from "next/cache";

export async function createBlogPostAction(values: BlogPostFormValues) {
    const validatedFields = blogPostSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("blog_posts").insert([validatedFields.data]);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao criar artigo." };
    }

    revalidatePath("/blog");
    return { success: true };
}

export async function updateBlogPostAction(id: string, values: BlogPostFormValues) {
    const validatedFields = blogPostSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from("blog_posts")
        .update(validatedFields.data)
        .eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao atualizar artigo." };
    }

    revalidatePath("/blog");
    return { success: true };
}

export async function deleteBlogPostAction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("blog_posts").delete().eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return { error: error.message || "Erro ao eliminar artigo." };
    }

    revalidatePath("/blog");
    return { success: true };
}
