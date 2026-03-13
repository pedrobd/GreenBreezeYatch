"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BlogPagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground font-body">
                Página <span className="font-bold text-[#0A1F1C]">{currentPage}</span> de <span className="font-bold text-[#0A1F1C]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/50 bg-white/50 hover:bg-white/80"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/50 bg-white/50 hover:bg-white/80"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
