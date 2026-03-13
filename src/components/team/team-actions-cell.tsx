"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Loader2, Edit2 } from "lucide-react";
import { EditMemberDialog } from "./edit-member-dialog";
import { deleteTeamMember } from "@/app/actions/team";
import { toast } from "sonner";

export function TeamActionsCell({ member, profiles = [] }: { member: any; profiles?: any[] }) {
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    async function handleDelete() {
        if (!confirm(`Remover ${member.name}?`)) return;

        setLoading(true);
        const result = await deleteTeamMember(member.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Colaborador removido.");
        }
        setLoading(false);
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-white/50 bg-white/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="font-heading text-xs text-[#0A1F1C]/60 uppercase tracking-widest">Opções</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setEditOpen(true)}
                        className="gap-2 cursor-pointer"
                    >
                        <Edit2 className="h-4 w-4" /> Editar Dados
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500 gap-2 font-bold cursor-pointer">
                        <Trash2 className="h-4 w-4" /> Remover
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditMemberDialog
                member={member}
                profiles={profiles}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
