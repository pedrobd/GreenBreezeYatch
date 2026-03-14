import { Metadata } from "next";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Anchor, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AddBoatDialog } from "@/components/fleet/add-boat-dialog";
import { FleetActionsCell } from "@/components/fleet/fleet-actions-cell";

export const metadata: Metadata = {
    title: "Frota | GreenBreeze Admin",
    description: "Gestão de Frota GreenBreeze",
};

export default async function FleetPage() {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        redirect("/");
    }

    // Fetch live data from Supabase
    const { data: fleet, error } = await supabase
        .from('fleet')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error("Error fetching fleet:", error);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Frota</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie a sua frota de embarcações, monitorize estados de manutenção e localizações em tempo real.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddBoatDialog />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#0A1F1C]/5">
                            <TableRow className="hover:bg-transparent border-white/20">
                                <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">ID</TableHead>
                                <TableHead className="w-[50px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Ordem</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Nome da Embarcação</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Tipo</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Capacidade</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Localização Atual</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Estado</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Preço Base</TableHead>
                                <TableHead className="w-[80px] py-6 px-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fleet && fleet.length > 0 ? (
                                fleet.map((boat) => (
                                    <TableRow key={boat.id} className="group hover:bg-white/30 border-white/10 transition-colors">
                                        <TableCell className="py-4 px-8">
                                            <span className="font-bold text-[#0A1F1C] opacity-20 text-[10px] font-body tracking-wider">#{boat.id.split('-')[0]}</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="font-bold text-[#0A1F1C]/40 text-xs font-body">{boat.order_index}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                    boat.is_partner ? "bg-[#44C3B2] text-white shadow-[#44C3B2]/20" : "bg-[#0A1F1C] text-[#44C3B2] shadow-[#0A1F1C]/10"
                                                )}>
                                                    {boat.is_partner ? <Users className="h-5 w-5" /> : <Anchor className="h-5 w-5" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[#0A1F1C] font-body text-sm leading-none mb-0.5">{boat.name}</span>
                                                        {boat.is_partner && (
                                                            <Badge variant="outline" className="text-[8px] h-3.5 px-1 bg-[#44C3B2]/5 text-[#44C3B2] border-[#44C3B2]/20 font-black uppercase tracking-tighter">
                                                                Parceiro
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-body uppercase tracking-tighter font-medium">
                                                        {boat.is_partner ? "Embarcação de Parceiro" : "Identificador Único"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-bold text-[#0A1F1C]/60 font-body">{boat.type}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#0A1F1C]/80 font-body text-sm">{boat.capacity}</span>
                                                <span className="text-[10px] font-black text-[#0A1F1C]/30 uppercase tracking-widest">Pessoas</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-body text-sm">
                                            {boat.current_location}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "border-white/20 transition-all",
                                                    boat.status === "Disponível"
                                                        ? "bg-[#44C3B2]/10 text-[#44C3B2] border-[#44C3B2]/20 hover:bg-[#44C3B2]/20"
                                                        : boat.status === "Manutenção"
                                                            ? "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                                                            : "bg-[#0A1F1C]/10 text-[#0A1F1C] border-[#0A1F1C]/20 hover:bg-[#0A1F1C]/20"
                                                )}
                                                variant="outline"
                                            >
                                                <span className={cn(
                                                    "h-1.5 w-1.5 rounded-full mr-2",
                                                    boat.status === "Disponível" ? "bg-[#44C3B2] animate-pulse" : boat.status === "Manutenção" ? "bg-red-500" : "bg-[#0A1F1C]"
                                                )} />
                                                {boat.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4 px-8 font-body font-bold text-[#0A1F1C] text-sm tabular-nums">
                                            €{Number(boat.base_price).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="py-4 px-8">
                                            <FleetActionsCell boat={boat} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Anchor className="h-10 w-10" />
                                            <p className="font-heading font-bold">Nenhuma embarcação encontrada</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
