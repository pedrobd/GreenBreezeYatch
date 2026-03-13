import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { AddFoodDialog } from "@/components/food/add-food-dialog";
import { FoodTable } from "@/components/food/food-table";
import { getUserProfile } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Menu de Refeições | GreenBreeze Admin",
    description: "Gestão do Menu de Comida e Bebidas",
};

const CATEGORIES = [
    "Menus Rápidos e Individuais",
    "Tábuas e Petiscos",
    "Experiências Premium Almoço ou Jantar",
    "Bebidas e Bar"
];

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FoodPage({ searchParams }: PageProps) {
    const { user } = await getUserProfile();
    if (user?.role === "skipper" || user?.role === "marinheiro") {
        redirect("/reservations");
    }

    const params = await searchParams;
    const currentCategory = (params.category as string) || CATEGORIES[0];
    const currentPage = Number(params.page) || 1;
    const itemsPerPage = 10;

    // Fetch live data from Supabase
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data: foodItems, count, error } = await supabase
        .from('food_menu')
        .select('*', { count: 'exact' })
        .eq('category', currentCategory)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .range(from, to);

    if (error) {
        console.error("Error fetching food menu:", error);
    }

    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Menu de Refeições</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie o cardápio de catering, bebidas e opções gastronómicas para os seus clientes.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddFoodDialog />
                </div>
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2 pb-2">
                {CATEGORIES.map(cat => (
                    <Link
                        key={cat}
                        href={`?category=${encodeURIComponent(cat)}&page=1`}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm",
                            currentCategory === cat
                                ? "bg-[#0A1F1C] text-white border-[#0A1F1C] shadow-[#0A1F1C]/20"
                                : "bg-white/40 text-[#0A1F1C]/60 border-white/40 hover:bg-white/60 backdrop-blur-md"
                        )}
                    >
                        {cat}
                    </Link>
                ))}
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <FoodTable items={foodItems || []} />
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <Link
                        href={`?category=${encodeURIComponent(currentCategory)}&page=${Math.max(1, currentPage - 1)}`}
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
                        href={`?category=${encodeURIComponent(currentCategory)}&page=${Math.min(totalPages, currentPage + 1)}`}
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
