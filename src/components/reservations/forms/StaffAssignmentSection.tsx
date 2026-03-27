import { useFormContext, useWatch } from "react-hook-form";
import { Clock, Anchor } from "lucide-react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReservationFormValues, TeamMember, StaffRate, BoatProgram } from "@/types/admin";
import { calculateStaffPayout, detectProgramFromTime } from "@/utils/staff-calculations";

interface StaffAssignmentSectionProps {
    team: TeamMember[];
    rates: StaffRate[];
    boatPrograms: BoatProgram[];
}

export function StaffAssignmentSection({
    team,
    rates,
    boatPrograms
}: StaffAssignmentSectionProps) {
    const { control } = useFormContext<ReservationFormValues>();
    const skipperId = useWatch({ control, name: "skipper_id" });
    const marinheiroId = useWatch({ control, name: "marinheiro_id" });
    const extraHours = useWatch({ control, name: "extra_hours" });
    const programId = useWatch({ control, name: "program_id" });

    const selectedProgram = boatPrograms.find(p => p.id === programId);
    const programString = `${selectedProgram?.name || ""} ${selectedProgram?.duration_hours || ""}h`;
    const detectedProgram = detectProgramFromTime(programString);

    const skipperPayout = calculateStaffPayout(
        "skipper",
        detectedProgram,
        Number(extraHours),
        rates,
        team.find(m => m.id === skipperId)
    );

    const marinheiroPayout = calculateStaffPayout(
        "marinheiro",
        detectedProgram,
        Number(extraHours),
        rates,
        team.find(m => m.id === marinheiroId)
    );

    return (
        <div className="space-y-4 pt-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                <Anchor className="h-3 w-3" /> Atribuição de Equipa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={control} name="skipper_id" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Skipper</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                            <FormControl>
                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                <SelectItem value="none">Nenhum</SelectItem>
                                {team.filter(m => m.role === 'skipper').map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                    </FormItem>
                )} />
                <FormField control={control} name="marinheiro_id" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Marinheiro</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                            <FormControl>
                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                <SelectItem value="none">Nenhum</SelectItem>
                                {team.filter(m => m.role === 'marinheiro').map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                    </FormItem>
                )} />
                <FormField control={control} name="extra_hours" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-1">
                            <Clock className="h-2 w-2" /> Horas Extra
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                step="0.5" 
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                                className="rounded-xl border-white/50 bg-white/50" 
                            />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                    </FormItem>
                )} />

                <div className="md:col-span-2 p-3 rounded-2xl bg-[#44C3B2]/5 border border-[#44C3B2]/20 flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Pagamento Estimado</span>
                    <div className="flex gap-4">
                        {skipperId && skipperId !== "none" && (
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[9px] px-1 h-4 bg-[#0A1F1C]/5 font-black uppercase">S</Badge>
                                <span className="text-xs font-bold text-[#0A1F1C]">€{skipperPayout}</span>
                            </div>
                        )}
                        {marinheiroId && marinheiroId !== "none" && (
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[9px] px-1 h-4 bg-[#44C3B2]/10 font-black uppercase">M</Badge>
                                <span className="text-xs font-bold text-[#0A1F1C]">€{marinheiroPayout}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
