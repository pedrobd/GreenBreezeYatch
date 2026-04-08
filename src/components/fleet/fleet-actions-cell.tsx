"use client";

import { useState } from "react";
import { MoreHorizontal, Settings2, Pencil, Trash2, Calendar } from "lucide-react";
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
import Link from "next/link";
import { EditBoatDialog } from "./edit-boat-dialog";
import { deleteBoatAction } from "@/app/actions/fleet";

interface Boat {
    id: string;
    name: string;
    type: string;
    capacity: number;
    current_location: string;
    status: "Disponível" | "Manutenção" | "Indisponível";
    base_price: number;
    image_url?: string | null;
}

interface FleetActionsCellProps {
    boat: Boat;
}

export function FleetActionsCell({ boat }: FleetActionsCellProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function onDelete() {
        setIsLoading(true);
        const result = await deleteBoatAction(boat.id);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Embarcação eliminada.");
            setIsDeleteOpen(false);
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
                <DropdownMenuContent align="end" className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl p-2 min-w-[200px] font-body">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 px-3 py-2">GESTÃO DE EMBARCAÇÃO</DropdownMenuLabel>

                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]">
                        <Link href={`/reservations?boatId=${boat.id}`}>
                            <Calendar className="mr-2 h-4 w-4 opacity-50" />
                            Ver Agenda
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => setIsEditOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]"
                    >
                        <Pencil className="mr-2 h-4 w-4 opacity-50" />
                        Editar Detalhes
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />

                    <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]">
                        <Settings2 className="mr-2 h-4 w-4 opacity-50" />
                        Registar Manutenção
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => setIsDeleteOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-red-500 focus:text-white transition-colors"
                    >
                        <Trash2 className="mr-2 h-4 w-4 opacity-50" />
                        Eliminar Barco
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditBoatDialog
                boat={boat}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Eliminar Embarcação?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-base leading-relaxed">
                            Tens a certeza que desejas eliminar permanentemente a embarcação <span className="font-bold text-[#0A1F1C]">"{boat.name}"</span>? Esta ação removerá o barco de todos os registos futuros.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-white/60 transition-all">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete();
                            }}
                            disabled={isLoading}
                            className="h-12 rounded-2xl bg-red-600 px-6 font-bold text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                        >
                            {isLoading ? "A eliminar..." : "Sim, eliminar embarcação"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
