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
import { EditFoodDialog } from "./edit-food-dialog";
import { deleteFoodAction } from "@/app/actions/food";

interface FoodItem {
    id: string;
    name: string;
    category: string;
    dietary_info?: string;
    stock: number;
    status: "Disponível" | "Esgotado" | "Indisponível";
    price: number | string;
    image_url?: string | null;
}

interface FoodActionsCellProps {
    item: FoodItem;
}

export function FoodActionsCell({ item }: FoodActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onDelete() {
        if (!confirm(`Tem a certeza que deseja eliminar "${item.name}" do menu?`)) return;

        setLoading(true);
        const result = await deleteFoodAction(item.id);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Artigo eliminado com sucesso!");
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
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 px-3 py-2">MANUTENÇÃO DE ARTIGO</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={() => setEditOpen(true)}
                        className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]"
                    >
                        Editar Artigo
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer focus:bg-[#0A1F1C] focus:text-[#44C3B2]">Gerir Imagens</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#0A1F1C]/5 mx-2" />
                    <DropdownMenuItem
                        onSelect={onDelete}
                        disabled={loading}
                        className="rounded-xl px-3 py-2 cursor-pointer text-red-600 focus:bg-red-600 focus:text-white"
                    >
                        Remover do Menu
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditFoodDialog
                item={item}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
