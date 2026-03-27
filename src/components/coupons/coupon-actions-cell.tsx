"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCouponAction } from "@/app/actions/coupons";
import { AddCouponDialog } from "./add-coupon-dialog";
import { Coupon, Boat } from "@/types/admin";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CouponActionsCellProps {
    coupon: Coupon;
    fleet: Pick<Boat, 'id' | 'name'>[];
}

export function CouponActionsCell({ coupon, fleet }: CouponActionsCellProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const result = await deleteCouponAction(coupon.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Cupão eliminado.");
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {/* Edit Button/Dialog */}
            <AddCouponDialog 
                fleet={fleet} 
                coupon={coupon} 
                open={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen}
                trigger={
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#0A1F1C]/5 rounded-xl">
                        <Pencil className="h-4 w-4 text-[#0A1F1C]/40" />
                    </Button>
                }
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 text-red-500 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-heading text-[#0A1F1C]">Eliminar Cupão</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/60 text-sm">
                            Tem a certeza que deseja eliminar o cupão <span className="font-black text-[#0A1F1C] uppercase">{coupon.code}</span>? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#0A1F1C]/5 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={loading}
                            className="h-12 rounded-2xl bg-red-500 px-6 text-white hover:bg-red-600 font-bold transition-all"
                        >
                            {loading ? "A eliminar..." : "Eliminar Permanentemente"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
