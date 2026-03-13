"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, XCircle, ClipboardCopy, CreditCard } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditReservationDialog } from "./edit-reservation-dialog";
import { updateReservationAction, initiateReservationPaymentAction } from "@/app/actions/reservations";

interface ReservationActionsCellProps {
    reservation: any;
    fleet: any[];
}

export function ReservationActionsCell({ reservation, fleet }: ReservationActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(reservation.id);
        toast.success("ID da reserva copiado!");
    };

    const handleCancel = async () => {
        if (!confirm("Tem a certeza que deseja cancelar esta reserva?")) return;

        setLoading(true);
        const result = await updateReservationAction(reservation.id, {
            ...reservation,
            status: "Cancelado"
        });
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Reserva cancelada com sucesso.");
        }
    };

    const handleSibsPayment = async () => {
        setLoading(true);
        const result = await initiateReservationPaymentAction(reservation.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else if (result.redirectUrl) {
            toast.info("A redirecionar para o portal de pagamento...");
            window.location.href = result.redirectUrl;
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

                    {reservation.status !== "Cancelado" && reservation.payment_status !== "Pago" && (
                        <>
                            <DropdownMenuItem
                                onClick={handleSibsPayment}
                                disabled={loading}
                                className="rounded-xl px-3 py-2 cursor-pointer bg-[#44C3B2]/10 text-[#0A1F1C] focus:bg-[#44C3B2] focus:text-white flex items-center gap-2"
                            >
                                <CreditCard className="h-4 w-4" />
                                {loading ? "A processar..." : "Pagar SIBS (Sandbox)"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />
                        </>
                    )}

                    {reservation.status !== "Cancelado" && (
                        <DropdownMenuItem
                            onClick={handleCancel}
                            disabled={loading}
                            className="rounded-xl px-3 py-2 cursor-pointer text-red-600 focus:bg-red-600 focus:text-white flex items-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            {loading ? "A processar..." : "Cancelar Reserva"}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <EditReservationDialog
                reservation={reservation}
                fleet={fleet}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
