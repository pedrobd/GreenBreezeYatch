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
import { Activity as ActivityIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { AddActivityDialog } from "@/components/activities/add-activity-dialog";
import { ActivityActionsCell } from "@/components/activities/activity-actions-cell";

export const metadata: Metadata = {
    title: "Atividades Extra | GreenBreeze Admin",
    description: "Gestão de Atividades Extra e Equipamentos",
};

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
    // Fetch live activities from Supabase
    const { data: activities, error } = await supabase
        .from('extra_activities')
        .select('*')
        .order('type')
        .order('name');

    if (error) {
        console.error("Error fetching activities:", error);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Atividades Extra</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie experiências adicionais, equipamentos de lazer e serviços complementares.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddActivityDialog />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#0A1F1C]/5">
                            <TableRow className="hover:bg-transparent border-white/20">
                                <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Visual</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Atividade / Equipamento</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Tipo</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Disponibilidade</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Stock</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Estado</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Preço</TableHead>
                                <TableHead className="w-[80px] py-6 px-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities && activities.length > 0 ? (
                                activities.map((activity) => (
                                    <TableRow key={activity.id} className="group hover:bg-white/30 border-white/10 transition-colors">
                                        <TableCell className="py-4 px-8">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/40 bg-[#0A1F1C] text-[#44C3B2] overflow-hidden shadow-lg shadow-[#0A1F1C]/10 transition-transform group-hover:scale-110">
                                                {activity.image_url ? (
                                                    <img src={activity.image_url} alt={activity.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <ActivityIcon className="h-5 w-5" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#0A1F1C] font-body text-sm leading-none mb-0.5">{activity.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-body uppercase tracking-tighter">REF: {activity.type.slice(0, 3).toUpperCase()}-{activity.id.slice(0, 4)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-bold text-[#0A1F1C]/60 font-body">{activity.type}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-body text-sm italic">
                                            {activity.availability || "Sempre disponível"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#0A1F1C]/80 font-body text-sm tabular-nums">{activity.stock > 900 ? "Livre" : activity.stock}</span>
                                                <span className="text-[10px] font-black text-[#0A1F1C]/30 uppercase tracking-widest font-body">Un.</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "border-white/20 transition-all",
                                                    activity.status === "Disponível"
                                                        ? "bg-[#44C3B2]/10 text-[#44C3B2] border-[#44C3B2]/20 hover:bg-[#44C3B2]/20"
                                                        : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                                                )}
                                                variant="outline"
                                            >
                                                <span className={cn(
                                                    "h-1.5 w-1.5 rounded-full mr-2",
                                                    activity.status === "Disponível" ? "bg-[#44C3B2] animate-pulse" : "bg-red-500"
                                                )} />
                                                {activity.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4 px-8 font-body font-bold text-[#0A1F1C] text-sm tabular-nums">
                                            €{Number(activity.price).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="py-4 px-8">
                                            <ActivityActionsCell activity={activity} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <ActivityIcon className="h-10 w-10 text-[#0A1F1C]" />
                                            <p className="font-heading font-bold text-[#0A1F1C]">Nenhuma atividade encontrada</p>
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
