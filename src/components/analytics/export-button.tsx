"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExportButtonProps {
    data: any[];
    filename?: string;
}

export function ExportButton({ data, filename = "greenbreeze-export" }: ExportButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            toast.error("Sem dados para exportar.");
            return;
        }

        try {
            // Define headers
            const headers = [
                "ID",
                "Data",
                "Horário",
                "Cliente",
                "Email",
                "Telemóvel",
                "Barco",
                "Origem",
                "Fatura",
                "Equipa",
                "Estado",
                "Valor Total (€)",
                "Notas"
            ];

            // Map data to rows
            const rows = data.map(r => {
                const equipe = [r.skipper?.name, r.marinheiro?.name].filter(Boolean).join(" / ") || "-";
                const origem = r.booking_sources?.name || r.source_type || "Cliente Final";

                return [
                    r.id,
                    r.date,
                    r.time,
                    `"${r.client_name}"`,
                    r.client_email || "-",
                    r.client_phone || "-",
                    `"${r.fleet?.name || 'N/A'}"`,
                    `"${origem}"`,
                    `"${r.invoice_number || '-'}"`,
                    `"${equipe}"`,
                    r.status,
                    r.total_amount.toFixed(2),
                    `"${(r.notes || '').replace(/\n/g, ' ')}"`
                ];
            });

            // Combine into CSV string
            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(","))
            ].join("\n");

            // Create blob and download
            const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
            link.setAttribute("href", url);
            link.setAttribute("download", `${filename}-${timestamp}.csv`);
            link.style.visibility = "hidden";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("CSV exportado com sucesso!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Erro ao exportar CSV.");
        }
    };

    return (
        <Button
            onClick={handleExport}
            className="rounded-2xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 font-bold px-6 border-white/10 shadow-xl"
        >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
        </Button>
    );
}
