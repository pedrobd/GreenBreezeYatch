"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Euro } from "lucide-react";
import { updateStaffRate } from "@/app/actions/rates";

interface RatesSettingsDialogProps {
    rates: any[];
}

export function RatesSettingsDialog({ rates }: RatesSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleUpdate(id: string, field: 'base_value' | 'extra_hour_value', value: number) {
        setLoading(true);
        const result = await updateStaffRate(id, { [field]: value });
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Valor atualizado.");
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                    Editar Taxas
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C]">Taxas de Pagamento</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 text-xs">
                        Defina os valores base de pagamento por programa e as taxas de horas extra.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Skipper Rates */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                            Skipper / Capitão
                        </h4>
                        <div className="grid gap-3">
                            {rates.filter(r => r.staff_role === 'skipper').map((rate) => (
                                <div key={rate.id} className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white/50">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0A1F1C] uppercase tracking-tight">{rate.program_code}</span>
                                        <span className="text-[10px] text-[#0A1F1C]/50">Programa de navegação</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[9px] font-bold text-[#0A1F1C]/40 uppercase tracking-tighter">Base</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                defaultValue={rate.base_value}
                                                className="w-24 h-9 rounded-xl border-none bg-white/80 pr-6 text-right font-bold text-sm"
                                                onBlur={(e) => handleUpdate(rate.id, 'base_value', parseFloat(e.target.value))}
                                            />
                                            <Euro className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0A1F1C]/30" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[9px] font-bold text-[#0A1F1C]/40 uppercase tracking-tighter">Extra /h</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                defaultValue={rate.extra_hour_value}
                                                className="w-24 h-9 rounded-xl border-none bg-white/80 pr-6 text-right font-bold text-sm"
                                                onBlur={(e) => handleUpdate(rate.id, 'extra_hour_value', parseFloat(e.target.value))}
                                            />
                                            <Euro className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0A1F1C]/30" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marinheiro Rates */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2 pt-2">
                            Marinheiro / Ajudante
                        </h4>
                        <div className="grid gap-3">
                            {rates.filter(r => r.staff_role === 'marinheiro').map((rate) => (
                                <div key={rate.id} className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white/50">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0A1F1C] uppercase tracking-tight">{rate.program_code}</span>
                                        <span className="text-[10px] text-[#0A1F1C]/50">Programa de navegação</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[9px] font-bold text-[#0A1F1C]/40 uppercase tracking-tighter">Base</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                defaultValue={rate.base_value}
                                                className="w-24 h-9 rounded-xl border-none bg-white/80 pr-6 text-right font-bold text-sm"
                                                onBlur={(e) => handleUpdate(rate.id, 'base_value', parseFloat(e.target.value))}
                                            />
                                            <Euro className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0A1F1C]/30" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[9px] font-bold text-[#0A1F1C]/40 uppercase tracking-tighter">Extra /h</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                defaultValue={rate.extra_hour_value}
                                                className="w-24 h-9 rounded-xl border-none bg-white/80 pr-6 text-right font-bold text-sm"
                                                onBlur={(e) => handleUpdate(rate.id, 'extra_hour_value', parseFloat(e.target.value))}
                                            />
                                            <Euro className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0A1F1C]/30" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button onClick={() => setOpen(false)} className="w-full rounded-xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 font-bold transition-all">
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
