import { Metadata } from "next";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, PenTool, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AddArticleDialog } from "@/components/blog/add-article-dialog";
import { ArticleActionsCell } from "@/components/blog/article-actions-cell";
import { BlogPagination } from "@/components/blog/blog-filters";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";

export const metadata: Metadata = {
    title: "Blog & Artigos | GreenBreeze Admin",
    description: "Gestão de Conteúdos do Blog",
};

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        redirect("/");
    }

    const resolvedParams = await searchParams;
    const page = Number(resolvedParams?.page) || 1;
    const limit = 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch live blog posts from Supabase
    const { data: blogPosts, count, error } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .order('publish_date', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching blog posts:", error);
    }
    
    const totalPages = count ? Math.ceil(count / limit) : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Blog & Conteúdo</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie os artigos do blog, notícias da marina e atualizações da GreenBreeze.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddArticleDialog />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#0A1F1C]/5">
                            <TableRow className="hover:bg-transparent border-white/20">
                                <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Capa</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Título do Artigo</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Categoria</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Autor</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Publicação</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Estado</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Vistas</TableHead>
                                <TableHead className="w-[80px] py-6 px-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogPosts && blogPosts.length > 0 ? (
                                blogPosts.map((post) => (
                                    <TableRow key={post.id} className="group hover:bg-white/30 border-white/10 transition-colors">
                                        <TableCell className="py-4 px-8">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/40 bg-[#0A1F1C] text-[#44C3B2] overflow-hidden shadow-lg shadow-[#0A1F1C]/10 transition-transform group-hover:scale-110">
                                                {post.cover_image_url ? (
                                                    <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <BookOpen className="h-5 w-5" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col max-w-[300px]">
                                                <span className="font-bold text-[#0A1F1C] font-body text-sm leading-tight mb-1 truncate">{post.title}</span>
                                                <span className="text-[10px] text-[#44C3B2] font-body font-black uppercase tracking-widest opacity-60">LEITURA RECOMENDADA</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-lg bg-[#0A1F1C]/5 text-[10px] font-bold text-[#0A1F1C]/60 uppercase tracking-tighter">
                                                {post.category}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-[#0A1F1C]/80 font-body text-sm">{post.author}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-body text-sm">
                                            {post.publish_date ? new Date(post.publish_date).toLocaleDateString('pt-PT') : "Rascunho"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "border-white/20 transition-all",
                                                    post.status === "Publicado"
                                                        ? "bg-[#44C3B2]/10 text-[#44C3B2] border-[#44C3B2]/20 hover:bg-[#44C3B2]/20"
                                                        : post.status === "Agendado"
                                                            ? "bg-[#0A1F1C]/10 text-[#0A1F1C] border-[#0A1F1C]/20 hover:bg-[#0A1F1C]/20"
                                                            : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                                )}
                                                variant="outline"
                                            >
                                                <span className={cn(
                                                    "h-1.5 w-1.5 rounded-full mr-1.5",
                                                    post.status === "Publicado" ? "bg-[#44C3B2] animate-pulse" : post.status === "Agendado" ? "bg-[#0A1F1C]" : "bg-muted-foreground"
                                                )} />
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4 px-8 font-body font-bold text-[#0A1F1C] text-sm tabular-nums">
                                            {post.views > 0 ? post.views : "0"}
                                        </TableCell>
                                        <TableCell className="py-4 px-8">
                                            <ArticleActionsCell post={post} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <BookOpen className="h-10 w-10 text-[#0A1F1C]" />
                                            <p className="font-heading font-bold text-[#0A1F1C]">Nenhum artigo encontrado</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <BlogPagination currentPage={page} totalPages={totalPages} />
                </CardContent>
            </Card>
        </div>
    );
}
