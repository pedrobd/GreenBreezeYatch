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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onDelete() {
        setLoading(true);
        const result = await deleteBlogPostAction(post.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Artigo eliminado com sucesso!");
            setDeleteOpen(false);
        }
    }

    async function onToggleStatus() {
        const newStatus = post.status === "Publicado" ? "Rascunho" : "Publicado";
        
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
            setPublishOpen(false);
        }
    }

    const nextStatusLabel = post.status === "Publicado" ? "Rascunho" : "Publicado";
    const publishDialogTitle = post.status === "Publicado" ? "Reverter para Rascunho?" : "Publicar Artigo?";
    const publishDialogDesc = post.status === "Publicado" 
        ? "Este artigo deixará de estar visível publicamente no blog." 
        : "Este artigo passará a estar visível publicamente no blog.";

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
                        onSelect={() => setPublishOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]"
                    >
                        {post.status === "Publicado" ? "Reverter p/ Rascunho" : "Publicar Agora"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />
                    <DropdownMenuItem
                        onSelect={() => setDeleteOpen(true)}
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

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Tens a certeza?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">
                            Estás prestar a eliminar permanentemente o artigo <span className="font-bold text-[#0A1F1C]">"{post.title}"</span>. Esta ação não pode ser revertida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-white/60 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); onDelete(); }}
                            disabled={loading}
                            className="h-12 rounded-2xl bg-red-600 px-6 font-bold text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                        >
                            {loading ? "A eliminar..." : "Sim, eliminar artigo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">{publishDialogTitle}</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">{publishDialogDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-white/60 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); onToggleStatus(); }}
                            disabled={loading}
                            className="h-12 rounded-2xl bg-[#0A1F1C] px-6 font-bold text-[#44C3B2] hover:bg-[#0A1F1C]/80 transition-all"
                        >
                            {loading ? "A processar..." : "Confirmar Alteração"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
