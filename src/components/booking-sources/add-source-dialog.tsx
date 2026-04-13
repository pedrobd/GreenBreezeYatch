"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Globe, Building2, Share2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { createBookingSourceAction } from "@/app/actions/booking-sources";

export function AddSourceDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            type: "Agencia",
            name: "",
        },
    });

    async function onSubmit(values: { type: string; name: string }) {
        setLoading(true);
        const result = await createBookingSourceAction(values);
        setLoading(false);

        if (result.error) toast.error(result.error);
        else {
            toast.success("Origem criada com sucesso!");
            setOpen(false);
            form.reset();
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                    <Plus className="mr-2 h-5 w-5" /> Adicionar Origem
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 border">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-bold font-heading text-[#0A1F1C]">Nova Origem</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60 text-sm">
                        Registe uma nova agência, rede social ou plataforma parceira.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70 font-bold">Categoria</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 border-white/50 bg-white/50 rounded-xl focus:ring-[#44C3B2]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                            <SelectItem value="Agencia">Agência</SelectItem>
                                            <SelectItem value="Redes Sociais">Redes Sociais</SelectItem>
                                            <SelectItem value="Plataformas">Plataformas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70 font-bold">Nome da Entidade</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Ex: Agency Plus, Instagram, Airbnb..." 
                                            {...field} 
                                            className="h-12 border-white/50 bg-white/50 rounded-xl focus-visible:ring-[#44C3B2]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpen(false)}
                                className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C]"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] font-bold shadow-xl shadow-[#0A1F1C]/20"
                            >
                                {loading ? "A criar..." : "Criar Origem"}
                                <Save className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
