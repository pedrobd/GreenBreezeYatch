import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { AddExtraDialog } from "@/components/extras/add-extra-dialog";
import { ExtrasTable } from "@/components/extras/extras-table";
import { getUserProfile } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Extras | GreenBreeze Admin",
    description: "Gestão de serviços extra disponíveis para todos os barcos",
};

const ITEMS_PER_PAGE = 9;

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExtrasPage({ searchParams }: PageProps) {
    const { user } = await getUserProfile();
    if (user?.role === "skipper" || user?.role === "marinheiro") {
        redirect("/reservations");
    }

    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data: extras, count, error } = await supabase
        .from("extras")
        .select("*", { count: "exact" })
        .order("name")
        .range(from, to);

    if (error) {
        console.error("Error fetching extras:", error);
    }

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Extras</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie os serviços extra disponíveis para todos os barcos. Estes extras alimentam a página do site e ficam disponíveis nas reservas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddExtraDialog />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <ExtrasTable items={extras || []} />
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <Link
                        href={`?page=${Math.max(1, currentPage - 1)}`}
                        className={cn(
                            "flex items-center justify-center p-2 rounded-full border border-white/30 bg-white/40 shadow-sm transition-all hover:bg-white/60",
                            currentPage === 1 && "pointer-events-none opacity-20"
                        )}
                        aria-disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-5 w-5 text-[#0A1F1C]" />
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0A1F1C]/70 font-body">
                            Página
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A1F1C] text-white text-xs font-bold shadow-lg shadow-[#0A1F1C]/20">
                            {currentPage}
                        </span>
                        <span className="text-sm font-bold text-[#0A1F1C]/70 font-body">
                            de {totalPages}
                        </span>
                    </div>

                    <Link
                        href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                        className={cn(
                            "flex items-center justify-center p-2 rounded-full border border-white/30 bg-white/40 shadow-sm transition-all hover:bg-white/60",
                            currentPage === totalPages && "pointer-events-none opacity-20"
                        )}
                        aria-disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-5 w-5 text-[#0A1F1C]" />
                    </Link>
                </div>
            )}
        </div>
    );
}
