"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditActivityDialog } from "./edit-activity-dialog";
import { deleteActivityAction } from "@/app/actions/activities";

interface Activity {
    id: string;
    name: string;
    type: string;
    price: number;
    status: "Disponível" | "Esgotado" | "Indisponível Temporariamente";
    stock: number;
    availability: string;
}

interface ActivityActionsCellProps {
    activity: Activity;
}

export function ActivityActionsCell({ activity }: ActivityActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onDelete() {
        if (!confirm(`Tem a certeza que deseja eliminar "${activity.name}"?`)) return;

        setLoading(true);
        const result = await deleteActivityAction(activity.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Atividade eliminada com sucesso!");
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl p-2 min-w-[170px]">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 px-3 py-2">GESTÃO DE OFERTA</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={() => setEditOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]"
                    >
                        Editar Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />
                    <DropdownMenuItem
                        onSelect={onDelete}
                        disabled={loading}
                        className="rounded-xl px-3 py-2 cursor-pointer text-red-600 focus:bg-red-600 focus:text-white"
                    >
                        Eliminar Atividade
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditActivityDialog
                activity={activity}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
