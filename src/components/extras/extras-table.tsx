"use client";

import { useState } from "react";
import { Pencil, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { extraSchema, ExtraFormValues } from "@/lib/validations/extras";
import { updateExtraAction, deleteExtraAction } from "@/app/actions/extras";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/blog/rich-text-editor";
import { optimizeCloudinaryUrl } from "@/lib/utils";

interface Extra {
    id: string;
    name: string;
    price: number;
    vat_rate: number;
    pricing_type: string;
    duration: string | null;
    description: string | null;
    image_url: string | null;
    show_in_frontoffice: boolean;
    is_active: boolean;
    category: string;
    quantity: number;
    sort_order: number;
}

interface ExtrasTableProps {
    items: Extra[];
}

export function ExtrasTable({ items }: ExtrasTableProps) {
    const router = useRouter();
    const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
    const [deletingExtra, setDeletingExtra] = useState<Extra | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<ExtraFormValues>({
        resolver: zodResolver(extraSchema) as any,
    });

    function openEditDialog(extra: Extra) {
        form.reset({
            name: extra.name,
            price: extra.price,
            vat_rate: extra.vat_rate,
            pricing_type: extra.pricing_type as "per_booking" | "per_person",
            duration: extra.duration || "",
            description: extra.description || "",
            image_url: extra.image_url || "",
            show_in_frontoffice: extra.show_in_frontoffice,
            is_active: extra.is_active,
            category: extra.category as "aluguer" | "aula",
            quantity: extra.quantity,
            sort_order: extra.sort_order || 0,
        });
        setEditingExtra(extra);
    }

    async function onEdit(values: ExtraFormValues) {
        if (!editingExtra) return;
        setLoading(true);
        const result = await updateExtraAction(editingExtra.id, values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Extra atualizado!");
            setEditingExtra(null);
            router.refresh();
        }
    }

    async function onDelete() {
        if (!deletingExtra) return;
        setLoading(true);
        const result = await deleteExtraAction(deletingExtra.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Extra eliminado!");
            setDeletingExtra(null);
            router.refresh();
        }
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-[#0A1F1C]/5 p-4 mb-4">
                    <ToggleLeft className="h-8 w-8 text-[#0A1F1C]/30" />
                </div>
                <p className="text-sm font-semibold text-[#0A1F1C]/50">Nenhum extra encontrado</p>
                <p className="text-xs text-[#0A1F1C]/30 mt-1">Adicione o primeiro serviço extra usando o botão acima.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#0A1F1C]/5">
                            <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Imagem</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Nome</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Preço</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Tipo</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Duração</th>
                            <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Site</th>
                            <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Ativo</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Categoria / Stock</th>
                            <th className="py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((extra) => (
                            <tr key={extra.id} className="border-b border-[#0A1F1C]/5 hover:bg-[#44C3B2]/5 transition-all">
                                <td className="py-3 px-4">
                                    {extra.image_url ? (
                                        <img src={optimizeCloudinaryUrl(extra.image_url, 'thumb')} alt={extra.name} className="h-12 w-16 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-12 w-16 rounded-lg bg-[#0A1F1C]/5 flex items-center justify-center">
                                            <span className="text-[10px] text-[#0A1F1C]/20 font-bold">N/A</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="font-semibold text-[#0A1F1C]">{extra.name}</span>
                                    {extra.description && (
                                        <p className="text-[11px] text-[#0A1F1C]/40 mt-0.5 line-clamp-1" dangerouslySetInnerHTML={{ __html: extra.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }} />
                                    )}
                                </td>
                                <td className="py-3 px-4 font-bold text-[#0A1F1C]">{extra.price.toFixed(2)} €</td>
                                <td className="py-3 px-4">
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#0A1F1C]/5 font-semibold text-[#0A1F1C]/60">
                                        {extra.pricing_type === "per_person" ? "/ pessoa" : "/ reserva"}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {extra.duration ? (
                                        <span className="text-xs flex items-center gap-1 text-[#0A1F1C]/60">
                                            <Clock className="h-3 w-3" />
                                            {extra.duration}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[#0A1F1C]/20">&mdash;</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {extra.show_in_frontoffice ? (
                                        <Eye className="h-4 w-4 text-emerald-500 mx-auto" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-[#0A1F1C]/20 mx-auto" />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {extra.is_active ? (
                                        <ToggleRight className="h-5 w-5 text-emerald-500 mx-auto" />
                                    ) : (
                                        <ToggleLeft className="h-5 w-5 text-[#0A1F1C]/20 mx-auto" />
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit ${extra.category === 'aula' ? 'bg-[#44C3B2]/20 text-[#0A1F1C]' : 'bg-[#0A1F1C]/10 text-[#0A1F1C]/60'}`}>
                                            {extra.category === 'aula' ? 'Aula' : 'Aluguer'}
                                        </span>
                                        <span className="text-[11px] font-medium text-[#0A1F1C]/40">
                                            Stock: {extra.quantity}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-[#44C3B2]/10" onClick={() => openEditDialog(extra)}>
                                            <Pencil className="h-3.5 w-3.5 text-[#0A1F1C]/50" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50" onClick={() => setDeletingExtra(extra)}>
                                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingExtra} onOpenChange={(o) => !o && setEditingExtra(null)}>
                <DialogContent className="sm:max-w-[700px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-3xl font-bold font-heading text-[#0A1F1C]">Editar Extra</DialogTitle>
                        <DialogDescription className="text-[#0A1F1C]/60">Atualize as informações deste serviço extra.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onEdit)} className="space-y-6 pt-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Nome</FormLabel>
                                    <FormControl><Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Preço (€) c/ IVA</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value)} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="pricing_type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="per_booking">Por Reserva</SelectItem>
                                                <SelectItem value="per_person">Por Pessoa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="duration" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Duração</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue placeholder="Sem duração definida" /></SelectTrigger></FormControl>
                                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                            <SelectItem value="30min">30 minutos</SelectItem>
                                            <SelectItem value="1h">1 hora</SelectItem>
                                            <SelectItem value="1h30">1 hora e 30 min</SelectItem>
                                            <SelectItem value="2h">2 horas</SelectItem>
                                            <SelectItem value="3h">3 horas</SelectItem>
                                            <SelectItem value="4h">4 horas</SelectItem>
                                            <SelectItem value="dia">Dia inteiro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Descrição</FormLabel>
                                    <FormControl>
                                        <RichTextEditor
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            placeholder="Descreva o serviço extra..."
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="image_url" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Imagem</FormLabel>
                                    <FormControl>
                                        <ImageUpload value={field.value || ""} onChange={(url) => field.onChange(url)} onRemove={() => field.onChange("")} disabled={loading} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="aluguer">Aluguer</SelectItem>
                                                <SelectItem value="aula">Aula</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Quantidade / Stock</FormLabel>
                                        <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="sort_order" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Posição na Página (Ordem)</FormLabel>
                                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="show_in_frontoffice" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/30 p-4">
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="text-xs font-semibold text-[#0A1F1C]/70 !mt-0 cursor-pointer">Visível no Site</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="is_active" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/30 p-4">
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="text-xs font-semibold text-[#0A1F1C]/70 !mt-0 cursor-pointer">Ativo</FormLabel>
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditingExtra(null)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all">Cancelar</Button>
                                <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                                    {loading ? "A guardar..." : "Guardar Alterações"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingExtra} onOpenChange={(o: boolean) => !o && setDeletingExtra(null)}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl font-body border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-xl text-[#0A1F1C]">Eliminar Extra</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60">
                            Tem a certeza que deseja eliminar <strong>{deletingExtra?.name}</strong>? Esta ação não pode ser revertida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} disabled={loading} className="rounded-xl bg-red-500 text-white hover:bg-red-600">
                            {loading ? "A eliminar..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
