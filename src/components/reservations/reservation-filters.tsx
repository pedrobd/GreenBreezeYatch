"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReservation } from "./reservation-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ReservationSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { navigate } = useReservation();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    // Debounce search
    useEffect(() => {
        const currentSearch = searchParams.get('search') || '';

        // Only trigger navigation if the local searchTerm actually differs from the URL
        if (searchTerm === currentSearch) {
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
                params.set('search', searchTerm);
            } else {
                params.delete('search');
            }
            params.set('page', '1'); // Reset pagination on search
            navigate(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, pathname, searchParams, navigate, router]);

    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A1F1C]/40" />
            <Input
                placeholder="Pesquisar cliente ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-2xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2] transition-all"
            />
        </div>
    );
}

export function ReservationTabs() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'upcoming';

    const getTabHref = (tabValue: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tabValue);
        params.set('page', '1');
        return `?${params.toString()}`;
    };

    return (
        <div className="bg-white/40 border border-white/50 backdrop-blur-xl p-1 rounded-2xl h-auto relative flex items-center">
            <Link
                href={getTabHref("upcoming")} scroll={false}
                className={cn("rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all", activeTab === "upcoming" ? "bg-[#0A1F1C] text-[#44C3B2] shadow-lg" : "text-[#0A1F1C]/60 hover:text-[#0A1F1C]")}
            >
                Próximas
            </Link>
            <Link
                href={getTabHref("pending")} scroll={false}
                className={cn("rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all", activeTab === "pending" ? "bg-[#0A1F1C] text-[#44C3B2] shadow-lg" : "text-[#0A1F1C]/60 hover:text-[#0A1F1C]")}
            >
                Pendentes
            </Link>
            <Link
                href={getTabHref("history")} scroll={false}
                className={cn("rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all", activeTab === "history" ? "bg-[#0A1F1C] text-[#44C3B2] shadow-lg" : "text-[#0A1F1C]/60 hover:text-[#0A1F1C]")}
            >
                Histórico
            </Link>
        </div>
    );
}

export function ReservationPagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { navigate, isNavigating } = useReservation();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        navigate(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
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
                    disabled={currentPage <= 1 || isNavigating}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/50 bg-white/50 hover:bg-white/80"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isNavigating}
                >
                    Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
