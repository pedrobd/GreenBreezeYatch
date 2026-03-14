"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { boatSchema, BoatFormValues } from "@/lib/validations/fleet";
import { updateBoatAction } from "@/app/actions/fleet";
import { BoatProgramsManager, BoatExtrasManager } from "./boat-pricing-managers";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

interface Boat {
    id: string;
    name: string;
    type: string;
    capacity: number;
    current_location: string;
    status: "Disponível" | "Manutenção" | "Indisponível";
    base_price: number;
    image_url?: string | null;
    is_partner?: boolean;
    setubal_surcharge?: number;
    description?: string | null;
    inclusions?: string | null;
    order_index?: number;
}

interface EditBoatDialogProps {
    boat: Boat;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditBoatDialog({ boat, open, onOpenChange }: EditBoatDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<BoatFormValues>({
        resolver: zodResolver(boatSchema) as any,
        defaultValues: {
            name: "",
            type: "",
            capacity: "",
            current_location: "",
            status: "Disponível",
            base_price: "",
            image_url: "",
            gallery: [],
            is_partner: false,
            setubal_surcharge: 50,
            description: "",
            inclusions: "",
            order_index: 0,
        },
    });

    // Update form values when boat changes
    useEffect(() => {
        if (boat) {
            form.reset({
                name: boat.name,
                type: boat.type,
                capacity: String(boat.capacity),
                current_location: boat.current_location,
                status: boat.status,
                base_price: String(boat.base_price || ""),
                image_url: boat.image_url || "",
                gallery: (boat as any).gallery || [],
                is_partner: (boat as any).is_partner || false,
                setubal_surcharge: String((boat as any).setubal_surcharge || 50),
                description: boat.description || "",
                inclusions: boat.inclusions || "",
                order_index: boat.order_index || 0,
            });
        }
    }, [boat, form]);

    async function onSubmit(values: BoatFormValues) {
        setLoading(true);
        const result = await updateBoatAction(boat.id, values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Embarcação atualizada com sucesso!");
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto text-[#0A1F1C]">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-bold font-heading">Editar Embarcação</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Atualize as especificações técnicas da embarcação <span className="font-bold text-[#44C3B2]">{boat?.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="detalhes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-white/50 border border-white/50 rounded-xl mb-4">
                        <TabsTrigger value="detalhes" className="rounded-lg">Detalhes</TabsTrigger>
                        <TabsTrigger value="programas" className="rounded-lg">Programas</TabsTrigger>
                        <TabsTrigger value="extras" className="rounded-lg">Extras</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detalhes">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
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
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Tipo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
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
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Capacidade</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value)}
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
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Preço Base (€)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value)}
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
                                                        onChange={(e) => field.onChange(e.target.value)}
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
                                                        onChange={(e) => field.onChange(e.target.value)}
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
                                                            disabled={loading}
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
                                                            onRemove={(urlToRemove) => field.onChange(field.value.filter((url) => url !== urlToRemove))}
                                                            disabled={loading}
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
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Estado</FormLabel>
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
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                                    <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                                        {loading ? "A atualizar..." : "Guardar Alterações"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="programas">
                        <BoatProgramsManager boatId={boat.id} />
                    </TabsContent>

                    <TabsContent value="extras">
                        <BoatExtrasManager boatId={boat.id} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
