"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, XCircle, ClipboardCopy, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { EditReservationDialog } from "./edit-reservation-dialog";
import { updateReservationAction, deleteReservationAction, cancelReservationAction } from "@/app/actions/reservations";

interface ReservationActionsCellProps {
    reservation: any;
    fleet: any[];
}

export function ReservationActionsCell({ reservation, fleet }: ReservationActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(reservation.id);
        toast.success("ID da reserva copiado!");
    };

    const handleCancel = async () => {
        setLoading(true);
        const result = await cancelReservationAction(reservation.id);
        setLoading(false);
        setCancelDialogOpen(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Reserva cancelada com sucesso.");
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteReservationAction(reservation.id);
        setLoading(false);
        setDeleteDialogOpen(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Reserva eliminada definitivamente.");
        }
    };


    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl p-2 min-w-[200px]">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 px-3 py-2">AÇÕES</DropdownMenuLabel>

                    <DropdownMenuItem
                        onClick={handleCopyId}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2] flex items-center gap-2"
                    >
                        <ClipboardCopy className="h-4 w-4" />
                        Copiar ID
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />

                    <DropdownMenuItem
                        onClick={() => setEditOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2] flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Editar Detalhes
                    </DropdownMenuItem>


                    {reservation.status !== "Cancelado" && (
                        <DropdownMenuItem
                            onClick={() => setCancelDialogOpen(true)}
                            disabled={loading}
                            className="rounded-xl px-3 py-2 cursor-pointer text-orange-600 focus:bg-orange-600 focus:text-white flex items-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            {loading ? "A processar..." : "Cancelar Reserva"}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />

                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={loading}
                        className="rounded-xl px-3 py-2 cursor-pointer text-red-600 focus:bg-red-600 focus:text-white flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        {loading ? "A eliminar..." : "Apagar Reserva"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Cancel Confirmation */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2 text-[#0A1F1C]">
                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                            Cancelar Reserva?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/70 text-base">
                            Esta ação irá mudar o estado da reserva para <strong>Cancelado</strong>. O cliente poderá receber uma notificação automática.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-black/5 px-6 font-bold text-[#0A1F1C] hover:bg-black/10 transition-all">Voltar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleCancel}
                            className="h-12 rounded-2xl bg-orange-600 px-6 text-white font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                        >
                            {loading ? "A processar..." : "Sim, Cancelar Reserva"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
                            <Trash2 className="h-6 w-6" />
                            Eliminar Permanentemente?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/70 text-base">
                            Esta ação é <strong>irreversível</strong>. Todos os dados desta reserva serão removidos definitivamente da base de dados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-black/5 px-6 font-bold text-[#0A1F1C] hover:bg-black/10 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="h-12 rounded-2xl bg-red-600 px-6 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                            {loading ? "A eliminar..." : "Eliminar Agora"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {editOpen && (
                <EditReservationDialog
                    reservation={reservation}
                    fleet={fleet}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    availableFood={[]} 
                    bookedDates={[]}   
                />
            )}
        </>
    );
}
