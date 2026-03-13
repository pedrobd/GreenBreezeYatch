"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { activitySchema, ActivityFormValues } from "@/lib/validations/activities";
import { updateActivityAction } from "@/app/actions/activities";

interface Activity {
    id: string;
    name: string;
    type: string;
    price: number;
    status: "Disponível" | "Esgotado" | "Indisponível Temporariamente";
    stock: number;
    availability: string;
}

interface EditActivityDialogProps {
    activity: Activity;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditActivityDialog({ activity, open, onOpenChange }: EditActivityDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema) as any,
        defaultValues: {
            name: "",
            type: "",
            price: "",
            status: "Disponível",
            stock: "999",
            availability: "Sempre",
        },
    });

    useEffect(() => {
        if (activity) {
            form.reset({
                name: activity.name,
                type: activity.type,
                price: String(activity.price),
                status: activity.status,
                stock: String(activity.stock),
                availability: activity.availability || "Sempre",
            });
        }
    }, [activity, form]);

    async function onSubmit(values: ActivityFormValues) {
        setLoading(true);
        const result = await updateActivityAction(activity.id, values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Atividade atualizada com sucesso!");
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border text-[#0A1F1C] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-bold font-heading">Editar Atividade</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Atualize os detalhes de <span className="font-bold text-[#44C3B2]">{activity?.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome da Atividade</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="Equipamento">Equipamento</SelectItem>
                                                <SelectItem value="Experiência">Experiência</SelectItem>
                                                <SelectItem value="Serviço">Serviço</SelectItem>
                                                <SelectItem value="Transporte">Transporte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="availability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Disponibilidade</FormLabel>
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
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Stock Disponível</FormLabel>
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
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Preço Base (€)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
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

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Estado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                <SelectValue placeholder="Selecione o estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                            <SelectItem value="Disponível">Disponível</SelectItem>
                                            <SelectItem value="Esgotado">Esgotado</SelectItem>
                                            <SelectItem value="Indisponível Temporariamente">Indisponível Temporariamente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

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
