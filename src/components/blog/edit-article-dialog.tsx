"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { blogPostSchema, BlogPostFormValues } from "@/lib/validations/blog";
import { updateBlogPostAction } from "@/app/actions/blog";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";

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

interface EditArticleDialogProps {
    post: BlogPost;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditArticleDialog({ post, open, onOpenChange }: EditArticleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [isSlugManual, setIsSlugManual] = useState(false);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostSchema) as any,
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            author: "",
            status: "Rascunho",
            category: "",
            cover_image_url: "",
        },
    });

    useEffect(() => {
        if (post) {
            form.reset({
                title: post.title,
                slug: post.slug,
                content: post.content,
                author: post.author,
                status: post.status,
                category: post.category,
                cover_image_url: post.cover_image_url || "",
                publish_date: post.publish_date || null,
            });
        }
    }, [post, form]);

    async function onSubmit(values: BlogPostFormValues) {
        setLoading(true);
        const result = await updateBlogPostAction(post.id, values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Artigo atualizado com sucesso!");
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border text-[#0A1F1C] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-bold font-heading">Editar Artigo</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Atualize o conteúdo, estado ou metadados de <span className="font-bold text-[#44C3B2]">{post?.title}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Título do Artigo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (!isSlugManual) {
                                                        const newSlug = generateSlug(e.target.value);
                                                        form.setValue("slug", newSlug, { shouldValidate: true });
                                                    }
                                                }}
                                                className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Slug (URL)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setIsSlugManual(true);
                                                }}
                                                className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="Marina">Marina</SelectItem>
                                                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                                <SelectItem value="Eventos">Eventos</SelectItem>
                                                <SelectItem value="Dicas">Dicas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="author"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Autor</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Conteúdo do Artigo</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Escreva aqui o seu artigo..."
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="cover_image_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Imagem de Capa</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || ""}
                                                    onChange={(url) => field.onChange(url)}
                                                    onRemove={() => field.onChange("")}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Estado de Publicação</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                        <SelectItem value="Rascunho">Rascunho</SelectItem>
                                                        <SelectItem value="Agendado">Agendado</SelectItem>
                                                        <SelectItem value="Publicado">Publicado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="publish_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Data de Publicação</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2] h-10 hover:bg-white/60 transition-all",
                                                                    !field.value && "text-muted-foreground text-[#0A1F1C]/40"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(new Date(field.value), "dd 'de' MMM, yy", { locale: pt })
                                                                ) : (
                                                                    <span className="text-[10px]">Selecione data</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-white/80 shadow-2xl" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                            locale={pt}
                                                            initialFocus
                                                            className="bg-white"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                            <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                                {loading ? "A atualizar..." : "Guardar Alterações"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
