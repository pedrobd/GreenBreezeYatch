import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { getUserProfile } from "@/app/actions/auth";
import { SourcesTable } from "@/components/booking-sources/sources-table";
import { AddSourceDialog } from "@/components/booking-sources/add-source-dialog";

export const metadata: Metadata = {
    title: "Origens de Reserva | GreenBreeze Admin",
    description: "Gestão de agências, redes sociais e plataformas de reserva",
};

export const dynamic = 'force-dynamic';

export default async function BookingSourcesPage() {
    const { user } = await getUserProfile();
    if (user?.role === "skipper" || user?.role === "marinheiro") {
        redirect("/reservations");
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: sources, error } = await supabaseAdmin
        .from("booking_sources")
        .select("*")
        .order("type", { ascending: true })
        .order("name", { ascending: true });

    if (error) console.error("Error fetching booking sources:", error);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Origens de Reserva</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie as entidades parceiras (Agências, Plataformas, Canais Sociais) para categorizar as suas receitas.
                    </p>
                </div>
                <div className="shrink-0">
                    <AddSourceDialog />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <SourcesTable items={sources || []} />
                </CardContent>
            </Card>
        </div>
    );
}
