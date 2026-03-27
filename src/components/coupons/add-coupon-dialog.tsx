"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Calendar as CalendarIcon, Tag, Percent, Ship, AlertCircle } from "lucide-react";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { couponSchema, CouponFormValues } from "@/lib/validations/coupons";
import { createCouponAction, updateCouponAction } from "@/app/actions/coupons";
import { Boat, Coupon } from "@/types/admin";
import { Badge } from "@/components/ui/badge";

interface AddCouponDialogProps {
    fleet: Pick<Boat, 'id' | 'name'>[];
    coupon?: Coupon; // If provided, we are editing
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function AddCouponDialog({ 
    fleet, 
    coupon, 
    open: externalOpen, 
    onOpenChange: setExternalOpen,
    trigger 
}: AddCouponDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControllable = externalOpen !== undefined && setExternalOpen !== undefined;
    const open = isControllable ? externalOpen : internalOpen;
    const onOpenChange = (val: boolean) => {
        if (isControllable) {
            setExternalOpen(val);
        } else {
            setInternalOpen(val);
        }
    };
    
    const [loading, setLoading] = useState(false);

    const isEditing = !!coupon;

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema) as any,
        defaultValues: coupon ? {
            code: coupon.code,
            discount_percentage: coupon.discount_percentage,
            boat_ids: coupon.boat_ids || [],
            start_date: coupon.start_date,
            end_date: coupon.end_date,
            is_active: coupon.is_active,
        } : {
            code: "",
            discount_percentage: 10,
            boat_ids: [],
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            is_active: true,
        },
    });

    const onSubmit = async (values: CouponFormValues) => {
        setLoading(true);
        const result = isEditing 
            ? await updateCouponAction(coupon!.id, values)
            : await createCouponAction(values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(isEditing ? "Cupão atualizado!" : "Cupão criado com sucesso!");
            onOpenChange(false);
            if (!isEditing) form.reset();
        }
    };

    const toggleBoat = (id: string) => {
        const current = form.getValues("boat_ids") || [];
        if (current.includes(id)) {
            form.setValue("boat_ids", current.filter(i => i !== id));
        } else {
            form.setValue("boat_ids", [...current, id]);
        }
    };

    const selectedBoats = form.watch("boat_ids") || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                        <Plus className="mr-2 h-5 w-5" /> Novo Cupão
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border">
                <DialogHeader className="space-y-3 text-[#0A1F1C]">
                    <DialogTitle className="text-3xl font-bold font-heading">
                        {isEditing ? "Editar Cupão" : "Novo Cupão de Desconto"}
                    </DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Configure as regras de desconto para este código promocional.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 pt-4 text-[#0A1F1C]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Código (Ex: VERAO2024)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CÓDIGO" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2] uppercase font-bold tracking-widest" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="discount_percentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Surgem % de Desconto</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type="number" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2] pr-10 font-bold" />
                                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-3">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Restrições de Barco</FormLabel>
                            <div className="bg-[#0A1F1C]/5 p-4 rounded-2xl border border-white/20">
                                <FormDescription className="text-[10px] mb-3">Se nenhum for selecionado, o cupão aplica-se a toda a frota.</FormDescription>
                                <div className="grid grid-cols-2 gap-2">
                                    {fleet.map(boat => (
                                        <button
                                            key={boat.id}
                                            type="button"
                                            onClick={() => toggleBoat(boat.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                                                selectedBoats.includes(boat.id)
                                                    ? "bg-[#0A1F1C] text-[#44C3B2] border-[#44C3B2]/30"
                                                    : "bg-white/50 text-[#0A1F1C]/40 border-transparent hover:bg-white/80"
                                            )}
                                        >
                                            <Ship className="h-3 w-3" />
                                            {boat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Data de Início</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Data de Expiração</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-white/50 bg-[#44C3B2]/5 p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-bold text-[#0A1F1C]">Cupão Ativo</FormLabel>
                                        <FormDescription className="text-[10px]">
                                            Desative para invalidar o código imediatamente sem o apagar.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all">Cancelar</Button>
                            <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                                {loading ? "A guardar..." : (isEditing ? "Atualizar Cupão" : "Criar Cupão")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
