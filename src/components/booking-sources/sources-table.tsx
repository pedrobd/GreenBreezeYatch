"use client";

import { useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Globe, Building2, Share2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { updateBookingSourceAction, deleteBookingSourceAction } from "@/app/actions/booking-sources";
import { useRouter } from "next/navigation";

interface BookingSource {
    id: string;
    type: string;
    name: string;
    is_active: boolean;
}

interface SourcesTableProps {
    items: BookingSource[];
}

export function SourcesTable({ items }: SourcesTableProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function toggleActive(item: BookingSource) {
        setLoadingId(item.id);
        const result = await updateBookingSourceAction(item.id, { is_active: !item.is_active });
        setLoadingId(null);
        
        if (result.error) toast.error(result.error);
        else {
            toast.success("Estado atualizado");
            router.refresh();
        }
    }

    async function deleteSource(id: string) {
        if (!confirm("Tem a certeza que deseja eliminar esta origem?")) return;
        
        setLoadingId(id);
        const result = await deleteBookingSourceAction(id);
        setLoadingId(null);

        if (result.error) toast.error(result.error);
        else {
            toast.success("Origem eliminada");
            router.refresh();
        }
    }

    function getTypeIcon(type: string) {
        switch (type) {
            case 'Agencia': return <Building2 className="h-4 w-4" />;
            case 'Redes Sociais': return <Share2 className="h-4 w-4" />;
            case 'Plataformas': return <Globe className="h-4 w-4" />;
            default: return null;
        }
    }

    function getTypeColor(type: string) {
        switch (type) {
            case 'Agencia': return "bg-blue-500/10 text-blue-600";
            case 'Redes Sociais': return "bg-purple-500/10 text-purple-600";
            case 'Plataformas': return "bg-orange-500/10 text-orange-600";
            default: return "";
        }
    }

    return (
        <Table>
            <TableHeader className="bg-[#0A1F1C]/5">
                <TableRow className="hover:bg-transparent border-white/20">
                    <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50">Tipo</TableHead>
                    <TableHead className="py-6 font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50">Nome / Empresa</TableHead>
                    <TableHead className="py-6 font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 text-center">Estado</TableHead>
                    <TableHead className="py-6 px-8 font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-body">
                            Nenhuma origem registada.
                        </TableCell>
                    </TableRow>
                )}
                {items.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-white/30 border-white/10 transition-colors">
                        <TableCell className="py-4 px-8">
                            <Badge variant="outline" className={`gap-1.5 px-3 py-1 rounded-lg border-none font-bold uppercase tracking-wider text-[10px] ${getTypeColor(item.type)}`}>
                                {getTypeIcon(item.type)}
                                {item.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-4 font-bold text-[#0A1F1C] text-sm">
                            {item.name}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={loadingId === item.id}
                                onClick={() => toggleActive(item)}
                                className={item.is_active ? "text-[#44C3B2]" : "text-gray-400"}
                            >
                                {item.is_active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                            </Button>
                        </TableCell>
                        <TableCell className="py-4 px-8 text-right space-x-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                                onClick={() => deleteSource(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
