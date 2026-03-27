import { useFormContext, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Anchor, 
    Users, 
    X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReservationFormValues, Boat, BoatProgram } from "@/types/admin";

interface ReservationDetailsSectionProps {
    fleet: Boat[];
    boatPrograms: BoatProgram[];
    bookedDates: Record<string, any>;
    season: 'low' | 'mid' | 'high';
}

export function ReservationDetailsSection({
    fleet,
    boatPrograms,
    bookedDates,
    season
}: ReservationDetailsSectionProps) {
    const { control, setValue } = useFormContext<ReservationFormValues>();
    const boatId = useWatch({ control, name: "boat_id" });
    const passengersAdults = useWatch({ control, name: "passengers_adults" });
    const passengersChildren = useWatch({ control, name: "passengers_children" });

    const selectedBoat = fleet.find(b => b.id === boatId);
    const totalPassengers = (Number(passengersAdults) || 0) + (Number(passengersChildren) || 0);
    const capacityExceeded = selectedBoat ? totalPassengers > selectedBoat.capacity : false;

    return (
        <div className="space-y-6">
            <h4 className="text-xs font-black text-[#0A1F1C] flex items-center gap-2 uppercase tracking-widest border-b border-[#0A1F1C]/5 pb-4">
                <CalendarIcon className="h-3 w-3" /> Detalhes da Reserva
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="boat_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Embarcação</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                        <SelectValue placeholder="Selecione um barco" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                    {fleet.map((boat) => (
                                        <SelectItem key={boat.id} value={boat.id}>
                                            {boat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px]" />
                            {selectedBoat && (
                                <div className="mt-1 text-[10px] flex items-center gap-2">
                                    <Badge variant="outline" className="text-[#0A1F1C]/40 border-none px-0">
                                        <Anchor className="h-3 w-3 mr-1" /> {selectedBoat.current_location}
                                    </Badge>
                                    <Badge variant="outline" className="text-[#0A1F1C]/40 border-none px-0">
                                        <Users className="h-3 w-3 mr-1" /> Cap. {selectedBoat.capacity}
                                    </Badge>
                                </div>
                            )}
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Data</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2] h-10 hover:bg-white/60 text-[#0A1F1C] hover:text-[#0A1F1C] transition-all",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(new Date(field.value), "dd 'de' MMMM, yyyy", { locale: pt })
                                            ) : (
                                                <span>Selecione uma data</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-white/80 shadow-2xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                        disabled={(date) =>
                                            date < new Date("1900-01-01")
                                        }
                                        modifiers={{ booked: bookedDates as any }}
                                        locale={pt}
                                        initialFocus
                                        className="bg-white"
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="program_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Horário / Programa</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                    <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                        <SelectValue placeholder="Selecione o programa" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                    {boatPrograms.length > 0 ? (
                                        boatPrograms.filter(p => p.is_active).map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} ({p.duration_hours}h) - {
                                                    season === 'low' ? p.price_low :
                                                    season === 'mid' ? p.price_mid :
                                                    p.price_high
                                                }€
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>Sem programas disponíveis</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Horário Específico</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 text-[#0A1F1C]" />
                                    <Input placeholder="Ex: 10:00 - 14:00" {...field} className="pl-10 rounded-xl border-white/50 bg-white/50" />
                                </div>
                            </FormControl>
                            <div className="mt-3 p-4 rounded-2xl bg-[#44C3B2]/5 border border-[#44C3B2]/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-[#0A1F1C] flex items-center gap-1.5 uppercase tracking-widest text-[9px] opacity-70">
                                        <Clock className="h-3 w-3 text-[#44C3B2]" /> Seleção Rápida
                                    </p>
                                    <span className="text-[9px] font-medium opacity-40 uppercase tracking-tighter">Horários Sugeridos</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "10h — 14h (Manhã)", value: "10:00 - 14:00" },
                                        { label: "15h — 19h (Tarde)", value: "15:00 - 19:00" },
                                        { label: "10h — 18h (8 Horas)", value: "10:00 - 18:00" },
                                        { label: "19h30 — 21h30 (Sunset)", value: "19:30 - 21:30" },
                                        { label: "10h — 16h (Viagem 6 Horas)", value: "10:00 - 16:00", span: true }
                                    ].map((opt) => (
                                        <Button
                                            key={opt.value}
                                            type="button"
                                            variant="ghost"
                                            className={cn(
                                                "h-auto py-2.5 px-3 text-[10px] justify-center border border-white/60 bg-white/60 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all rounded-xl font-bold shadow-sm",
                                                opt.span && "col-span-2"
                                            )}
                                            onClick={() => setValue("time", opt.value)}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="total_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Valor Total (€)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="passengers_adults"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Adultos</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="passengers_children"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Crianças</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="boarding_location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Local de Embarque</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                        <SelectValue placeholder="Selecione o local" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                    <SelectItem value="Mitrena">Mitrena</SelectItem>
                                    <SelectItem value="Setúbal">Setúbal (Taxa extra)</SelectItem>
                                    <SelectItem value="Tróia">Tróia</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-[10px]" />
                        </FormItem>
                    )}
                />
            </div>
            {capacityExceeded && (
                <div className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-xl flex items-center gap-2">
                    <X className="h-3 w-3" /> A lotação máxima do barco foi ultrapassada!
                </div>
            )}
        </div>
    );
}
