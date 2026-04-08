"use client";

import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { boatSchema, BoatFormValues } from "@/lib/validations/fleet";
import { createBoatAction } from "@/app/actions/fleet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoatProgramsManager, BoatExtrasManager } from "./boat-pricing-managers";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

export function AddBoatDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [createdBoatId, setCreatedBoatId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("detalhes");

    const form = useForm<BoatFormValues>({
        resolver: zodResolver(boatSchema) as Resolver<BoatFormValues>,
        defaultValues: {
            name: "",
            type: "",
            capacity: 0,
            current_location: "Mitrena",
            status: "Disponível",
            base_price: undefined,
            image_url: "",
            gallery: [],
            is_partner: false,
            setubal_surcharge: 50,
            order_index: 0,
            description: "",
            inclusions: "",
        },
    });

    async function onSubmit(values: BoatFormValues) {
        setLoading(true);
        const result = await createBoatAction(values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Embarcação adicionada com sucesso! Prossiga para configurar os programas.");
            if ('id' in result && result.id) {
                setCreatedBoatId(result.id);
                setActiveTab("programas");
            }
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setCreatedBoatId(null);
            setActiveTab("detalhes");
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                    <Plus className="mr-2 h-5 w-5" /> Adicionar Embarcação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-bold font-heading text-[#0A1F1C]">Nova Embarcação v1.0.5</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Insira os detalhes técnicos para registar uma nova embarcação na frota GreenBreeze.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                    <TabsList className="grid w-full grid-cols-3 bg-white/50 border border-white/50 rounded-xl mb-4">
                        <TabsTrigger value="detalhes" className="rounded-lg">1. Detalhes</TabsTrigger>
                        <TabsTrigger value="programas" className="rounded-lg" disabled={!createdBoatId}>2. Programas</TabsTrigger>
                        <TabsTrigger value="extras" className="rounded-lg" disabled={!createdBoatId}>3. Extras</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detalhes">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Nome</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Ocean Escape" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Tipo</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Catamarã" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="capacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Capacidade</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="base_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Preço Base (€)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
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
                                        name="current_location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Localização Base</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                            <SelectValue placeholder="Selecione..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                        <SelectItem value="Mitrena">Mitrena</SelectItem>
                                                        <SelectItem value="Setúbal">Setúbal</SelectItem>
                                                        <SelectItem value="Tróia">Tróia</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="setubal_surcharge"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Taxa Setúbal (€)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="order_index"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Ordem (ex: 0, 1, 2...)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Descrição do Barco</FormLabel>
                                                    <FormControl>
                                                        <div className="rounded-xl border border-white/50 bg-white/50 overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-white/80 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px]">
                                                            <ReactQuill theme="snow" value={field.value || ""} onChange={field.onChange} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="inclusions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">O que está incluído</FormLabel>
                                                    <FormControl>
                                                        <div className="rounded-xl border border-white/50 bg-white/50 overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-white/80 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[120px]">
                                                            <ReactQuill theme="snow" value={field.value || ""} onChange={field.onChange} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="image_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Imagem Principal</FormLabel>
                                                    <FormControl>
                                                        <ImageUpload
                                                            value={field.value || ""}
                                                            onChange={(url) => field.onChange(url)}
                                                            onRemove={() => field.onChange("")}
                                                            disabled={loading || !!createdBoatId}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gallery"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Galeria</FormLabel>
                                                    <FormControl>
                                                        <MultiImageUpload
                                                            value={field.value || []}
                                                            onChange={(urls) => field.onChange(urls)}
                                                            onRemove={(urlToRemove) => field.onChange((field.value || []).filter((url) => url !== urlToRemove))}
                                                            disabled={loading || !!createdBoatId}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="is_partner"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/50 bg-white/50 p-4 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 text-wrap">Parceiro</FormLabel>
                                                            <div className="text-[8px] text-[#0A1F1C]/60 leading-tight">
                                                                Reservas email.
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <input
                                                                type="checkbox"
                                                                checked={field.value}
                                                                onChange={field.onChange}
                                                                className="h-5 w-5 rounded border-white/50 bg-white/50 text-[#44C3B2] focus:ring-[#44C3B2]"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Estado</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                                <SelectItem value="Disponível">Disponível</SelectItem>
                                                                <SelectItem value="Manutenção">Manutenção</SelectItem>
                                                                <SelectItem value="Indisponível">Indisponível</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">
                                        {createdBoatId ? "Concluir" : "Cancelar"}
                                    </Button>
                                    {!createdBoatId && (
                                        <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                                            {loading ? "A guardar..." : "Registar Barco"}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="programas">
                        {createdBoatId && <BoatProgramsManager boatId={createdBoatId} />}
                    </TabsContent>

                    <TabsContent value="extras">
                        {createdBoatId && <BoatExtrasManager boatId={createdBoatId} />}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
