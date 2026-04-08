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
import { EditMemberDialog } from "./edit-member-dialog";
import { deleteTeamMember } from "@/app/actions/team";
import { toast } from "sonner";

export function TeamActionsCell({ member, profiles = [] }: { member: { id: string; name: string; role: string; [key: string]: unknown }; profiles?: { id: string; full_name: string }[] }) {
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deleteTeamMember(member.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Colaborador removido.");
            setDeleteOpen(false);
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
                        onSelect={() => setEditOpen(true)}
                        className="gap-2 cursor-pointer"
                    >
                        <Edit2 className="h-4 w-4" /> Editar Dados
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={() => setDeleteOpen(true)}
                        className="text-red-500 focus:text-red-500 gap-2 font-bold cursor-pointer focus:bg-red-500 focus:text-white"
                    >
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

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Remover Colaborador?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">
                            Estás prestar a remover <span className="font-bold text-[#0A1F1C]">"{member.name}"</span> da equipa. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-white/60 transition-all">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={loading}
                            className="h-12 rounded-2xl bg-red-600 px-6 font-bold text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                        >
                            {loading ? "A remover..." : "Sim, remover colaborador"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
