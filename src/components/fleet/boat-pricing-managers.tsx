"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { optimizeCloudinaryUrl } from "@/lib/utils";

import { boatProgramSchema, boatExtraSchema } from "@/lib/validations/fleet";
import { z } from "zod";
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
    createBoatProgramAction, updateBoatProgramAction, deleteBoatProgramAction, getBoatProgramsAction,
    createBoatExtraAction, updateBoatExtraAction, deleteBoatExtraAction, getBoatExtrasAction
} from "@/app/actions/fleet";

// --- BOAT PROGRAMS MANAGER ---

export function BoatProgramsManager({ boatId }: { boatId: string }) {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof boatProgramSchema>>({
        resolver: zodResolver(boatProgramSchema) as any,
        defaultValues: { boat_id: boatId, name: "", duration_hours: 4, price_low: 0, price_mid: 0, price_high: 0, vat_rate: 6, is_active: true }
    });

    useEffect(() => { loadPrograms(); }, [boatId]);

    async function loadPrograms() {
        setLoading(true);
        const { data } = await getBoatProgramsAction(boatId);
        if (data) setPrograms(data);
        setLoading(false);
    }

    function startEdit(p: any) {
        form.reset({
            id: p.id, boat_id: boatId, name: p.name, duration_hours: p.duration_hours,
            price_low: p.price_low, price_mid: p.price_mid, price_high: p.price_high, vat_rate: p.vat_rate, is_active: p.is_active
        });
        setEditingId(p.id);
        setIsCreating(false);
    }

    function startCreate() {
        form.reset({ boat_id: boatId, name: "", duration_hours: 4, price_low: 0, price_mid: 0, price_high: 0, vat_rate: 6, is_active: true });
        setEditingId(null);
        setIsCreating(true);
    }

    function cancelEdit() {
        setEditingId(null);
        setIsCreating(false);
        form.reset();
    }

    async function onSubmit(values: z.infer<typeof boatProgramSchema>) {
        let res;
        if (isCreating) res = await createBoatProgramAction(values);
        else if (editingId) res = await updateBoatProgramAction(editingId, values);

        if (res?.error) toast.error(res.error);
        else {
            toast.success("Programa guardado com sucesso!");
            cancelEdit();
            loadPrograms();
        }
    }

    async function handleDelete() {
        if (!deleteId) return;
        const res = await deleteBoatProgramAction(deleteId);
        if (res.error) toast.error(res.error);
        else {
            toast.success("Programa eliminado.");
            setDeleteId(null);
            loadPrograms();
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A1F1C]/50">Programas de Aluguer</h3>
                {!isCreating && !editingId && (
                    <Button onClick={startCreate} size="sm" className="bg-[#44C3B2] text-[#0A1F1C] hover:bg-[#44C3B2]/80">
                        <Plus className="mr-2 h-4 w-4" /> Novo Programa
                    </Button>
                )}
            </div>

            {(isCreating || editingId) && (
                <div className="bg-white/50 border border-white/50 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in duration-300">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome do Programa (Ex: Meio Dia)</FormLabel>
                                    <FormControl><Input {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="duration_hours" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Duração (Horas)</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="vat_rate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">IVA (%)</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <FormField control={form.control} name="price_low" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest opacity-50">Época Baixa</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="price_mid" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest opacity-50">Época Média</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="price_high" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest opacity-50">Época Alta</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
                                <Button type="submit" size="sm" className="bg-[#0A1F1C] text-[#44C3B2]"><Save className="h-4 w-4 mr-1" /> Guardar</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            )}

            <div className="border border-white/50 rounded-2xl bg-white/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/40">
                        <TableRow>
                            <TableHead className="text-[10px] font-black uppercase opacity-50">Programa</TableHead>
                            <TableHead className="text-[10px] font-black uppercase opacity-50 text-center">Horas</TableHead>
                            <TableHead className="text-[10px] font-black uppercase opacity-50">Preços (B/M/A)</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase opacity-50">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto text-[#44C3B2]" /></TableCell></TableRow>
                        ) : programs.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-xs opacity-50">Nenhum programa definido.</TableCell></TableRow>
                        ) : programs.map(p => (
                            <TableRow key={p.id} className="hover:bg-white/40">
                                <TableCell className="font-medium text-xs">{p.name} {p.is_active ? '' : '(Inativo)'}</TableCell>
                                <TableCell className="text-center text-xs">{p.duration_hours}h</TableCell>
                                <TableCell className="text-xs font-mono">{p.price_low}€ / {p.price_mid}€ / {p.price_high}€</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(p)}><Edit2 className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Eliminar Programa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">
                            Tem a certeza que deseja eliminar este programa? Esta ação não pode ser revertida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-white/60 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="h-12 rounded-2xl bg-red-600 px-6 font-bold text-white hover:bg-red-700 transition-all">Eliminar permanentemente</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --- BOAT EXTRAS MANAGER ---

export function BoatExtrasManager({ boatId }: { boatId: string }) {
    const [extras, setExtras] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const form = useForm<z.infer<typeof boatExtraSchema>>({
        resolver: zodResolver(boatExtraSchema) as any,
        defaultValues: { boat_id: boatId, name: "", description: "", image_url: "", price: 0, vat_rate: 23, pricing_type: "per_booking", is_active: true, show_in_frontoffice: true }
    });

    useEffect(() => { loadExtras(); }, [boatId]);

    async function loadExtras() {
        setLoading(true);
        const { data } = await getBoatExtrasAction(boatId);
        if (data) setExtras(data);
        setLoading(false);
    }

    function startEdit(e: any) {
        form.reset({
            id: e.id, boat_id: boatId, name: e.name, description: e.description || "", image_url: e.image_url || "", price: e.price, vat_rate: e.vat_rate, pricing_type: e.pricing_type, is_active: e.is_active, show_in_frontoffice: e.show_in_frontoffice ?? true
        });
        setEditingId(e.id);
        setIsCreating(false);
    }

    function startCreate() {
        form.reset({ boat_id: boatId, name: "", description: "", image_url: "", price: 0, vat_rate: 23, pricing_type: "per_booking", is_active: true, show_in_frontoffice: true });
        setEditingId(null);
        setIsCreating(true);
    }

    function cancelEdit() {
        setEditingId(null);
        setIsCreating(false);
        form.reset();
    }

    async function onSubmit(values: z.infer<typeof boatExtraSchema>) {
        let res;
        if (isCreating) res = await createBoatExtraAction(values);
        else if (editingId) res = await updateBoatExtraAction(editingId, values);

        if (res?.error) toast.error(res.error);
        else {
            toast.success("Extra guardado com sucesso!");
            cancelEdit();
            loadExtras();
        }
    }

    async function handleDelete() {
        if (!deleteId) return;
        const res = await deleteBoatExtraAction(deleteId);
        if (res.error) toast.error(res.error);
        else {
            toast.success("Extra eliminado.");
            setDeleteId(null);
            loadExtras();
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A1F1C]/50">Extras da Embarcação</h3>
                {!isCreating && !editingId && (
                    <Button onClick={startCreate} size="sm" className="bg-[#44C3B2] text-[#0A1F1C] hover:bg-[#44C3B2]/80">
                        <Plus className="mr-2 h-4 w-4" /> Novo Extra
                    </Button>
                )}
            </div>

            {(isCreating || editingId) && (
                <div className="bg-white/50 border border-white/50 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in duration-300">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome (Ex: Wakeboard)</FormLabel>
                                        <FormControl><Input {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Preço (€)</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-8 text-xs bg-white/50 border-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="pricing_type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Tipo de Cobrança</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-8 text-xs bg-white/50 border-white/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="per_booking">Por Reserva</SelectItem>
                                                <SelectItem value="per_person">Por Pessoa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="show_in_frontoffice" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/50 bg-white/30 p-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-bold">Mostrar no Site</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Descrição do Extra</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Ex: Equipamento completo para descobrir o Parque Natural..." {...field} className="text-xs bg-white/50 border-white/50 resize-none" rows={2} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="image_url" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Imagem do Extra</FormLabel>
                                    <FormControl>
                                        <ImageUpload value={field.value || ""} onChange={(url) => field.onChange(url)} onRemove={() => field.onChange("")} disabled={isCreating === false && !editingId} />
                                    </FormControl>
                                </FormItem>
                            )} />
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
                                <Button type="submit" size="sm" className="bg-[#0A1F1C] text-[#44C3B2]"><Save className="h-4 w-4 mr-1" /> Guardar</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            )}

            <div className="border border-white/50 rounded-2xl bg-white/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/40">
                        <TableRow>
                            <TableHead className="text-[10px] font-black uppercase opacity-50">Nome</TableHead>
                            <TableHead className="text-[10px] font-black uppercase opacity-50">Preço</TableHead>
                            <TableHead className="text-[10px] font-black uppercase opacity-50">Tipo</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase opacity-50">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto text-[#44C3B2]" /></TableCell></TableRow>
                        ) : extras.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-xs opacity-50">Nenhum extra definido.</TableCell></TableRow>
                        ) : extras.map(e => (
                            <TableRow key={e.id} className="hover:bg-white/40">
                                <TableCell className="font-medium text-xs">
                                    <div className="flex items-center gap-2">
                                        {e.image_url ? <img src={optimizeCloudinaryUrl(e.image_url, 'thumb')} alt="" className="w-6 h-6 rounded-md object-cover" /> : <div className="w-6 h-6 rounded-md bg-black/5" />}
                                        <span>{e.name} {e.is_active ? '' : '(Inativo)'} {!e.show_in_frontoffice && <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1 rounded ml-1">Oculto no Site</span>}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs">{e.price}€</TableCell>
                                <TableCell className="text-xs">{e.pricing_type === 'per_booking' ? 'Por Reserva' : 'Por Pessoa'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(e)}><Edit2 className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(e.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Eliminar Extra?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">
                            Tem a certeza que deseja eliminar este extra? Esta ação não pode ser revertida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-white/60 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="h-12 rounded-2xl bg-red-600 px-6 font-bold text-white hover:bg-red-700 transition-all">Eliminar permanentemente</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
