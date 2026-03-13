"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export async function exportReservationsCSVAction() {
    try {
        const supabase = createAdminClient();

        // Fetch reservations with related boat info
        const { data, error } = await supabase
            .from("reservations")
            .select(`
                id,
                client_name,
                client_email,
                client_phone,
                date,
                time,
                status,
                total_amount,
                payment_status,
                payment_method,
                notes,
                created_at,
                fleet (
                    name,
                    type
                )
            `)
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching reservations for export:", error);
            return { error: "Erro ao exportar dados." };
        }

        if (!data || data.length === 0) {
            return { error: "Não existem reservas para exportar." };
        }

        // Convert JSON to CSV manually
        const headers = [
            "ID Reserva",
            "Data",
            "Hora",
            "Nome Cliente",
            "Email",
            "Telefone",
            "Barco",
            "Estado Status",
            "Total (€)",
            "Estado Pagamento",
            "Método Pagamento",
            "Notas",
            "Data Criação"
        ].join(",");

        const csvRows = data.map((res: any) => {
            const boatName = res.fleet ? res.fleet.name : 'N/A';
            return [
                res.id,
                res.date,
                res.time,
                `"${res.client_name}"`,
                res.client_email || "",
                res.client_phone || "",
                `"${boatName}"`,
                res.status,
                res.total_amount,
                res.payment_status,
                res.payment_method || "",
                `"${(res.notes || "").replace(/"/g, '""')}"`,
                new Date(res.created_at).toLocaleString('pt-PT')
            ].join(",");
        });

        const csvString = [headers, ...csvRows].join("\n");
        return { csv: csvString };
    } catch (err) {
        console.error("Error generating CSV:", err);
        return { error: "Erro interno ao gerar CSV." };
    }
}
