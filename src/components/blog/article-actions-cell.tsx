"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditArticleDialog } from "./edit-article-dialog";
import { deleteBlogPostAction, updateBlogPostAction } from "@/app/actions/blog";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    publish_date?: string | null;
    status: "Rascunho" | "Publicado" | "Agendado";
    category: string;
    cover_image_url?: string;
}

interface ArticleActionsCellProps {
    post: BlogPost;
}

export function ArticleActionsCell({ post }: ArticleActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onDelete() {
        if (!confirm(`Tem a certeza que deseja eliminar "${post.title}"?`)) return;

        setLoading(true);
        const result = await deleteBlogPostAction(post.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Artigo eliminado com sucesso!");
        }
    }

    async function onToggleStatus() {
        const newStatus = post.status === "Publicado" ? "Rascunho" : "Publicado";
        const message = newStatus === "Publicado" ? "Publicar Artigo" : "Reverter para Rascunho";

        if (!confirm(`Deseja ${message.toLowerCase()}?`)) return;

        setLoading(true);
        const result = await updateBlogPostAction(post.id, {
            ...post,
            status: newStatus as any,
            cover_image_url: post.cover_image_url || "",
            publish_date: post.publish_date || null,
        });
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Estado atualizado para ${newStatus}!`);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl p-2 min-w-[190px]">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 px-3 py-2">GESTÃO DE CONTEÚDO</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={() => setEditOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]"
                    >
                        Editar Artigo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={onToggleStatus}
                        disabled={loading}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]"
                    >
                        {post.status === "Publicado" ? "Reverter p/ Rascunho" : "Publicar Agora"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />
                    <DropdownMenuItem
                        onSelect={onDelete}
                        disabled={loading}
                        className="rounded-xl px-3 py-2 cursor-pointer text-red-600 focus:bg-red-600 focus:text-white"
                    >
                        Eliminar Artigo
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditArticleDialog
                post={post}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
