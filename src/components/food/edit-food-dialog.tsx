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
import { foodSchema, FoodFormValues } from "@/lib/validations/food";
import { updateFoodAction } from "@/app/actions/food";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/blog/rich-text-editor";

interface FoodItem {
    id: string;
    name: string;
    category: string;
    dietary_info?: string;
    stock: number;
    status: "Disponível" | "Esgotado" | "Indisponível";
    price: number | string;
    image_url?: string | null;
    description?: string | null;
}

interface EditFoodDialogProps {
    item: FoodItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditFoodDialog({ item, open, onOpenChange }: EditFoodDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<FoodFormValues>({
        resolver: zodResolver(foodSchema),
        defaultValues: {
            name: "",
            category: "",
            description: "",
            dietary_info: "Geral",
            stock: "999",
            status: "Disponível",
            price: "",
            image_url: "",
        },
    });

    useEffect(() => {
        if (item) {
            form.reset({
                name: item.name,
                category: item.category,
                description: item.description || "",
                dietary_info: item.dietary_info || "Geral",
                stock: String(item.stock),
                status: item.status,
                price: String(item.price),
                image_url: item.image_url || "",
            });
        }
    }, [item, form]);

    async function onSubmit(values: FoodFormValues) {
        setLoading(true);
        const result = await updateFoodAction(item.id, values);
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
            <DialogContent className="sm:max-w-[1000px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border text-[#0A1F1C] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-3xl font-bold font-heading">Editar Artigo</DialogTitle>
                    <DialogDescription className="text-[#0A1F1C]/60">
                        Atualize os detalhes de <span className="font-bold text-[#44C3B2]">{item?.name}</span> no cardápio.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome do Artigo</FormLabel>
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
                                                <SelectItem value="Menus Rápidos e Individuais">Menus Rápidos e Individuais</SelectItem>
                                                <SelectItem value="Tábuas e Petiscos">Tábuas e Petiscos</SelectItem>
                                                <SelectItem value="Experiências Premium Almoço ou Jantar">Experiências Premium Almoço ou Jantar</SelectItem>
                                                <SelectItem value="Bebidas e Bar">Bebidas e Bar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Alérgenos</FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Glúten", "Lactose", "Marisco", "Peixe", "Vegan", "Vegetariano"].map((allergen) => (
                                        <div key={allergen} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`edit-${allergen}`}
                                                className="h-4 w-4 rounded border-gray-300 text-[#44C3B2] focus:ring-[#44C3B2]"
                                                checked={form.watch("dietary_info")?.includes(allergen)}
                                                onChange={(e) => {
                                                    let current = form.getValues("dietary_info") || "";
                                                    if (current === "Geral") current = "";
                                                    const allergens = current.split(", ").filter(Boolean);
                                                    let newAllergens;
                                                    if (e.target.checked) {
                                                        newAllergens = [...allergens, allergen];
                                                    } else {
                                                        newAllergens = allergens.filter(a => a !== allergen);
                                                    }
                                                    const finalValue = newAllergens.join(", ");
                                                    form.setValue("dietary_info", finalValue || "Geral");
                                                }}
                                            />
                                            <label htmlFor={`edit-${allergen}`} className="text-xs font-medium text-[#0A1F1C]/70 cursor-pointer">{allergen}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Preço Unitário (€)</FormLabel>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Descrição do Prato</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="Descreve os ingredientes, modo de preparação..."
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="image_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Url Da Imagem</FormLabel>
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
                                                    <SelectItem value="Indisponível">Indisponível</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
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
