"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { updateTeamMember } from "@/app/actions/team";
import { toast } from "sonner";

export function EditMemberDialog({
    member,
    profiles = [],
    open,
    onOpenChange
}: {
    member: any;
    profiles?: any[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<"skipper" | "marinheiro">(member.role);
    const [rates, setRates] = useState({
        sunset: member.rate_sunset || (member.role === "marinheiro" ? 55 : 0),
        halfDay: member.rate_half_day || (member.role === "skipper" ? 55 : 65),
        sixHour: member.rate_6hour || (member.role === "marinheiro" ? 90 : 0),
        fullDay: member.rate_full_day || (member.role === "skipper" ? 90 : 110),
        extra: member.rate_extra_hour || (member.role === "skipper" ? 20 : 30)
    });

    const handleRoleChange = (newRole: "skipper" | "marinheiro") => {
        setRole(newRole);
        if (newRole === "skipper") {
            setRates({ sunset: 0, halfDay: 55, sixHour: 0, fullDay: 90, extra: 20 });
        } else {
            setRates({ sunset: 55, halfDay: 65, sixHour: 90, fullDay: 110, extra: 30 });
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await updateTeamMember(member.id, formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Dados do colaborador atualizados.");
            onOpenChange(false);
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C]">Editar Colaborador</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60">
                        Atualize as informações pessoais e financeiras de {member.name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[#0A1F1C] font-semibold text-xs uppercase tracking-wider opacity-60">Nome Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={member.name}
                                required
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-[#0A1F1C] font-semibold text-xs uppercase tracking-wider opacity-60">Função Principal</Label>
                            <Select name="role" value={role} onValueChange={(v: any) => handleRoleChange(v)} required>
                                <SelectTrigger className="rounded-xl border-[#0A1F1C]/10 bg-white/50">
                                    <SelectValue placeholder="Selecione a função" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-white/50 bg-white/95 backdrop-blur-xl">
                                    <SelectItem value="skipper">Skipper / Capitão</SelectItem>
                                    <SelectItem value="marinheiro">Ajudante / Marinheiro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nif" className="text-[#0A1F1C] font-semibold text-xs uppercase tracking-wider opacity-60">NIF</Label>
                            <Input
                                id="nif"
                                name="nif"
                                defaultValue={member.nif || ""}
                                placeholder="Nº Contribuinte"
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="userId" className="text-[#0A1F1C] font-semibold text-xs uppercase tracking-wider opacity-60">Vincular a Login</Label>
                            <Select name="userId" defaultValue={member.user_id || "none"}>
                                <SelectTrigger className="rounded-xl border-[#0A1F1C]/10 bg-white/50">
                                    <SelectValue placeholder="Sem login" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-white/50 bg-white/95 backdrop-blur-xl">
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {profiles.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="billingAddress" className="text-[#0A1F1C] font-semibold text-xs uppercase tracking-wider opacity-60">Morada de Faturação</Label>
                        <Input
                            id="billingAddress"
                            name="billingAddress"
                            defaultValue={member.billing_address || ""}
                            placeholder="Rua, Código Postal, Localidade"
                            className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                        />
                    </div>

                    <div className="pt-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 mb-3 border-b border-[#0A1F1C]/5 pb-1">Taxas de Pagamento Personalizadas</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="rateSunset" className="text-[9px] font-bold uppercase text-[#0A1F1C]/50 ml-1">Sunset (3h)</Label>
                                <div className="relative">
                                    <Input
                                        id="rateSunset"
                                        name="rateSunset"
                                        type="number"
                                        value={rates.sunset}
                                        onChange={(e) => setRates({ ...rates, sunset: parseFloat(e.target.value) })}
                                        className="rounded-xl border-[#0A1F1C]/10 bg-white/50 pr-6 text-sm font-bold"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-30">€</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="rateHalfDay" className="text-[9px] font-bold uppercase text-[#0A1F1C]/50 ml-1">Meio Dia (4h)</Label>
                                <div className="relative">
                                    <Input
                                        id="rateHalfDay"
                                        name="rateHalfDay"
                                        type="number"
                                        value={rates.halfDay}
                                        onChange={(e) => setRates({ ...rates, halfDay: parseFloat(e.target.value) })}
                                        className="rounded-xl border-[#0A1F1C]/10 bg-white/50 pr-6 text-sm font-bold"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-30">€</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="rate6hour" className="text-[9px] font-bold uppercase text-[#0A1F1C]/50 ml-1">6 Horas</Label>
                                <div className="relative">
                                    <Input
                                        id="rate6hour"
                                        name="rate6hour"
                                        type="number"
                                        value={rates.sixHour}
                                        onChange={(e) => setRates({ ...rates, sixHour: parseFloat(e.target.value) })}
                                        className="rounded-xl border-[#0A1F1C]/10 bg-white/50 pr-6 text-sm font-bold"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-30">€</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="rateFullDay" className="text-[9px] font-bold uppercase text-[#0A1F1C]/50 ml-1">Dia Inteiro (8h)</Label>
                                <div className="relative">
                                    <Input
                                        id="rateFullDay"
                                        name="rateFullDay"
                                        type="number"
                                        value={rates.fullDay}
                                        onChange={(e) => setRates({ ...rates, fullDay: parseFloat(e.target.value) })}
                                        className="rounded-xl border-[#0A1F1C]/10 bg-white/50 pr-6 text-sm font-bold"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-30">€</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="rateExtraHour" className="text-[9px] font-bold uppercase text-[#0A1F1C]/50 ml-1">Hora Extra</Label>
                                <div className="relative">
                                    <Input
                                        id="rateExtraHour"
                                        name="rateExtraHour"
                                        type="number"
                                        value={rates.extra}
                                        onChange={(e) => setRates({ ...rates, extra: parseFloat(e.target.value) })}
                                        className="rounded-xl border-[#0A1F1C]/10 bg-white/50 pr-6 text-sm font-bold"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-30">€</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 font-bold h-12 transition-all shadow-lg shadow-[#0A1F1C]/10"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Alterações
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
