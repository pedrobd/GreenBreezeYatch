"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Sparkles, Wand2, Calendar as CalendarIcon } from "lucide-react";
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
    DialogTrigger,
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
import { createBlogPostAction } from "@/app/actions/blog";
import { RichTextEditor } from "./rich-text-editor";
import { generateBlogContentAction } from "@/app/actions/ai";
import { ImageUpload } from "@/components/ui/image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Languages } from "lucide-react";

export function AddArticleDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [aiTheme, setAiTheme] = useState("");
    const [isSlugManual, setIsSlugManual] = useState(false);

    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostSchema) as any,
        defaultValues: {
            title: "",
            title_en: "",
            slug: "",
            content: "",
            content_en: "",
            author: "GreenBreeze Admin",
            status: "Rascunho",
            category: "Experiências",
            cover_image_url: "",
        },
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    async function onSubmit(values: BlogPostFormValues) {
        setLoading(true);
        const result = await createBlogPostAction(values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Artigo criado com sucesso!");
            setOpen(false);
            form.reset();
        }
    }

    async function onGenerate() {
        if (!aiTheme) {
            toast.error("Por favor, introduz um tema para gerar.");
            return;
        }

        setGenerating(true);
        const result = await generateBlogContentAction(aiTheme);
        setGenerating(true); // Keep loading while processing

        if (result.error) {
            toast.error(result.error);
        } else if (result.data) {
            const { title, title_en, content, content_en, category } = result.data;
            form.setValue("title", title);
            form.setValue("title_en", title_en || "");
            form.setValue("content", content);
            form.setValue("content_en", content_en || "");
            form.setValue("category", category || "Experiências");
            form.setValue("slug", generateSlug(title));
            setIsSlugManual(false);
            toast.success("Conteúdo multilingue gerado com sucesso!");
        }
        setGenerating(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                    <Plus className="mr-2 h-5 w-5" /> Novo Artigo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3 text-[#0A1F1C]">
                    <DialogTitle className="text-3xl font-bold font-heading">Novo Artigo</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Crie um novo artigo para o blog ou uma notícia relevante para a GreenBreeze.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 text-[#0A1F1C]">
                        {/* Global Settings */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0A1F1C]/5 border border-[#44C3B2]/10">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50 h-10">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Experiências">Experiências</SelectItem>
                                                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                                <SelectItem value="Eventos">Eventos</SelectItem>
                                                <SelectItem value="Dicas">Dicas</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            <Input {...field} className="h-10 rounded-xl border-white/50 bg-white/50" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50 h-10">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Rascunho">Rascunho</SelectItem>
                                                <SelectItem value="Agendado">Agendado</SelectItem>
                                                <SelectItem value="Publicado">Publicado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="publish_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Data</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal h-10 rounded-xl border-white/50 bg-white/50", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(new Date(field.value), "dd/MM/yy") : "Definir data"}
                                                        <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} locale={pt} />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* AI Assistant */}
                        <div className="p-6 rounded-2xl bg-[#0A1F1C]/5 border border-[#44C3B2]/20 space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#44C3B2]" />
                                <span className="text-xs font-bold uppercase tracking-wider">Assistente AI GreenBreeze (PT + EN)</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Tema do artigo (Ex: Novas rotas de iates elétricos...)"
                                    value={aiTheme}
                                    onChange={(e) => setAiTheme(e.target.value)}
                                    className="rounded-xl h-12 flex-1"
                                />
                                <Button type="button" onClick={onGenerate} disabled={generating} className="rounded-xl bg-[#44C3B2] text-[#0A1F1C] font-bold px-6 h-12">
                                    {generating ? "A gerar multilingue..." : "Gerar Versões PT/EN"}
                                    <Wand2 className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content Tabs */}
                        <Tabs defaultValue="pt" className="w-full">
                            <div className="flex items-center justify-between mb-4 mt-2">
                                <TabsList className="bg-[#0A1F1C]/5 p-1 rounded-xl">
                                    <TabsTrigger value="pt" className="rounded-lg px-6 font-bold">Português</TabsTrigger>
                                    <TabsTrigger value="en" className="rounded-lg px-6 font-bold flex gap-2">English <Languages className="h-3 w-3" /></TabsTrigger>
                                </TabsList>
                                
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 space-y-0">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">URL Slug:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    onChange={(e) => { field.onChange(e); setIsSlugManual(true); }}
                                                    className="w-48 h-8 text-[10px] rounded-lg border-white/50 bg-white/50"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <TabsContent value="pt" className="mt-0 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Título (Português)</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            {...field} 
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                if (!isSlugManual) form.setValue("slug", generateSlug(e.target.value));
                                                            }}
                                                            className="text-xl font-bold h-12 rounded-xl" 
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Conteúdo (Português)</FormLabel>
                                                    <FormControl>
                                                        <RichTextEditor value={field.value} onChange={field.onChange} minHeight="400px" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="en" className="mt-0 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title_en"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Title (English)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="text-xl font-bold h-12 rounded-xl border-[#44C3B2]/30" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="content_en"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Content (English)</FormLabel>
                                                    <FormControl>
                                                        <RichTextEditor value={field.value || ""} onChange={field.onChange} minHeight="400px" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </div>

                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="cover_image_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2">Imagem de Capa (Shared)</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value || ""}
                                                        onChange={(url) => field.onChange(url)}
                                                        onRemove={() => field.onChange("")}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="p-4 rounded-xl bg-[#0A1F1C]/30 text-[#44C3B2] text-[10px] italic space-y-2">
                                        <p>💡 A AI agora gera automaticamente as versões em Português e Inglês.</p>
                                        <p>Dica: Podes alternar entre as abas para rever ou ajustar o conteúdo traduzido.</p>
                                    </div>
                                </div>
                            </div>
                        </Tabs>

                        <div className="flex justify-end gap-3 pt-6 border-t border-[#0A1F1C]/10">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-12 rounded-2xl bg-white/40 px-6 font-bold">Cancelar</Button>
                            <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-8 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold">
                                {loading ? "A criar..." : "Publicar Artigo Multilingue"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
