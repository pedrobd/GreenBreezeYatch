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
import { MoreHorizontal, Shield, Trash2, Loader2, Pencil } from "lucide-react";
import { deleteSystemUser, updateSystemUserRole } from "@/app/actions/users";
import { toast } from "sonner";
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
import { EditUserDialog } from "./edit-user-dialog";

interface UserActionsProps {
    userId: string;
    currentRole: string;
    email: string;
    fullName: string;
}

export function UserActionsCell({ userId, currentRole, email, fullName }: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // Protection for the main admin account
    const isMainAdmin = email === "info@greenbreeze.pt";

    async function handleDelete() {
        setLoading(true);
        const result = await deleteSystemUser(userId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Utilizador removido.");
            setDeleteOpen(false);
        }
        setLoading(false);
    }

    async function handleRoleChange(newRole: string) {
        setLoading(true);
        const result = await updateSystemUserRole(userId, newRole);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Cargo atualizado.");
        }
        setLoading(false);
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                        <span className="sr-only">Abrir menu</span>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-white/50 bg-white/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="font-heading text-xs text-[#0A1F1C]/60 uppercase tracking-widest">Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!isMainAdmin && (
                        <>
                            <DropdownMenuItem onSelect={() => setEditOpen(true)} className="gap-2 font-bold text-[#0A1F1C]">
                                <Pencil className="h-4 w-4" /> Editar Utilizador
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="font-heading text-[10px] text-[#0A1F1C]/40 uppercase mt-2 px-2">Alterar Cargo</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleRoleChange("admin")} className="gap-2">
                                <Shield className="h-4 w-4 text-[#44C3B2]" /> Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleRoleChange("booking_manager")} className="gap-2">
                                <Shield className="h-4 w-4 text-blue-500" /> Gestor
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleRoleChange("skipper")} className="gap-2">
                                <Shield className="h-4 w-4 text-amber-500" /> Skipper
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleRoleChange("marinheiro")} className="gap-2">
                                <Shield className="h-4 w-4 text-teal-500" /> Marinheiro
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeleteOpen(true)} className="text-red-500 focus:text-red-500 gap-2 font-bold focus:bg-red-500 focus:text-white">
                                <Trash2 className="h-4 w-4" /> Remover Utilizador
                            </DropdownMenuItem>
                        </>
                    )}
                    {isMainAdmin && (
                        <DropdownMenuItem disabled className="text-[10px] italic">Conta de sistema (protegida)</DropdownMenuItem>
                    )}
                </DropdownMenuContent>

                <EditUserDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    user={{ id: userId, fullName, role: currentRole, email }}
                />
            </DropdownMenu>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Tens a certeza?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">
                            Estás prestar a remover o utilizador <span className="font-bold text-[#0A1F1C]">"{fullName}" ({email})</span>. Esta ação não pode ser desfeita.
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
                            {loading ? "A remover..." : "Sim, remover utilizador"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
