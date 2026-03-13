"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableHead } from "@/components/ui/table";
import { useReservation } from "./reservation-context";

interface SortableTableHeadProps {
    column: string;
    label: string;
    className?: string;
}

export function SortableTableHead({ column, label, className }: SortableTableHeadProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { navigate, isNavigating } = useReservation();

    const currentSort = searchParams.get("sort");
    const currentOrder = searchParams.get("order") || "asc";

    const isActive = currentSort === column;

    const handleSort = () => {
        const params = new URLSearchParams(searchParams);

        if (isActive) {
            if (currentOrder === "desc") {
                params.delete("sort");
                params.delete("order");
            } else {
                params.set("order", "desc");
            }
        } else {
            params.set("sort", column);
            params.set("order", "asc");
        }

        params.set("page", "1"); // Reset pagination
        navigate(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <TableHead
            className={cn("cursor-pointer select-none group hover:bg-[#0A1F1C]/5 transition-all text-[#0A1F1C]/50 font-black text-[10px] uppercase tracking-widest py-6", isNavigating && "opacity-50 pointer-events-none", className)}
            onClick={handleSort}
        >
            <div className="flex items-center gap-1.5">
                {label}
                {isActive ? (
                    currentOrder === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-[#44C3B2]" />
                    ) : (
                        <ArrowDown className="h-3 w-3 text-[#44C3B2]" />
                    )
                ) : (
                    <ArrowUpDown className="h-3 w-3 text-[#0A1F1C]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
        </TableHead>
    );
}
