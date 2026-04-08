import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { AddExtraDialog } from "@/components/extras/add-extra-dialog";
import { ExtrasTable } from "@/components/extras/extras-table";
import { getUserProfile } from "@/app/actions/auth";

export const metadata: Metadata = {
    title: "Extras | GreenBreeze Admin",
    description: "Gestão de serviços extra disponíveis para todos os barcos",
};

export const dynamic = 'force-dynamic';

export default async function ExtrasPage() {
    const { user } = await getUserProfile();
    if (user?.role === "skipper" || user?.role === "marinheiro") {
        redirect("/reservations");
    }

    // Fetch Global Extras
    const { data: extras, error: extrasError } = await supabase
        .from("extras")
        .select("*")
        .order("name");

    if (extrasError) console.error("Error fetching extras:", extrasError);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Extras</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie os serviços extra disponíveis. Estes itens alimentam a página do site e ficam disponíveis nas reservas.
                    </p>
                </div>
                <div className="shrink-0">
                    <AddExtraDialog />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <ExtrasTable items={extras || []} />
                </CardContent>
            </Card>
        </div>
    );
}
