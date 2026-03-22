"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, User, Clock, Euro, Save, Anchor, Users, Plus, Minus, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Form,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { reservationSchema, ReservationFormValues } from "@/lib/validations/reservations";
import {
    updateReservationAction,
    getReservationDatesAction,
    getExtraActivitiesAction,
    getFoodMenuAction
} from "@/app/actions/reservations";
import { getBoatProgramsAction, getBoatExtrasAction } from "@/app/actions/fleet";
import { getExtrasAction } from "@/app/actions/extras";
import { getTeamMembers } from "@/app/actions/team";
import { getStaffRates } from "@/app/actions/rates";
import { calculateStaffPayout, detectProgramFromTime } from "@/utils/staff-calculations";
import { COUNTRIES } from "@/lib/constants/countries";
import { useReservationPricing } from "./hooks/use-reservation-pricing";
interface EditReservationDialogProps {
    reservation: any;
    fleet: any[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditReservationDialog({ reservation, fleet, open, onOpenChange }: EditReservationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [rates, setRates] = useState<any[]>([]);
    const [availableFood, setAvailableFood] = useState<any[]>([]);


    useEffect(() => {
        if (open) {
            getReservationDatesAction().then((result) => {
                if (result.data) {
                    setBookedDates(result.data.map((d: string) => new Date(d)));
                }
            });
            getTeamMembers().then((result) => {
                if (result.team) setTeam(result.team);
            });
            getStaffRates().then((result) => {
                if (result.rates) setRates(result.rates);
            });
            getFoodMenuAction().then((result) => {
                if (result.data) setAvailableFood(result.data);
            });
        }
    }, [open]);

    const form = useForm<ReservationFormValues>({
        resolver: zodResolver(reservationSchema) as any,
        defaultValues: {
            client_name: reservation?.client_name || "",
            client_email: reservation?.client_email || "",
            client_phone: reservation?.client_phone || "",
            boat_id: reservation?.boat_id || "",
            program_id: reservation?.program_id || "",
            date: reservation?.date || "",
            time: reservation?.time || "",
            status: reservation?.status || "Pendente",
            subtotal_amount: reservation?.subtotal_amount || 0,
            extras_amount: reservation?.extras_amount || 0,
            vat_base_amount: reservation?.vat_base_amount || 0,
            vat_extras_amount: reservation?.vat_extras_amount || 0,
            total_amount: reservation?.total_amount || 0,
            notes: reservation?.notes || "",
            skipper_id: reservation?.skipper_id || "",
            marinheiro_id: reservation?.marinheiro_id || "",
            extra_hours: reservation?.extra_hours || 0,
            selected_activities: (reservation as any)?.reservation_activities || [],
            selected_food: (reservation as any)?.reservation_food || [],
            boarding_location: reservation?.boarding_location || "Mitrena",
            passengers_adults: reservation?.passengers_adults || 1,
            passengers_children: reservation?.passengers_children || 0,
            client_address: reservation?.client_address || "",
            client_country: reservation?.client_country || "Portugal",
        },
    });

    // Auto-calculate total amount
    const selectedBoatId = form.watch("boat_id");
    const selectedActivities = form.watch("selected_activities") || [];
    const selectedFood = form.watch("selected_food") || [];
    const selectedBoardingLocation = form.watch("boarding_location");
    const passengersAdults = form.watch("passengers_adults");
    const passengersChildren = form.watch("passengers_children");

    const selectedBoat = fleet.find(b => b.id === selectedBoatId);
    const totalPassengers = (Number(passengersAdults) || 0) + (Number(passengersChildren) || 0);
    const capacityExceeded = selectedBoat ? totalPassengers > selectedBoat.capacity : false;

    const selectedDate = form.watch("date");
    const selectedProgramId = form.watch("program_id");
    const isPartner = selectedBoat?.is_partner || false;

    const { boatPrograms, boatExtras, season } = useReservationPricing({
        form,
        selectedBoatId: selectedBoatId || "",
        selectedDate: selectedDate || "",
        selectedProgramId: selectedProgramId || "",
        selectedActivities,
        selectedFood,
        selectedBoardingLocation,
        totalPassengers,
        isPartner,
        selectedBoat,
        availableFood
    });

    useEffect(() => {
        if (reservation) {
            form.reset({
                client_name: reservation.client_name || "",
                client_email: reservation.client_email || "",
                client_phone: reservation.client_phone || "",
                boat_id: reservation.boat_id || "",
                program_id: reservation.program_id || "",
                date: reservation.date || "",
                status: reservation.status || "Pendente",
                subtotal_amount: reservation.subtotal_amount || 0,
                extras_amount: reservation.extras_amount || 0,
                vat_base_amount: reservation.vat_base_amount || 0,
                vat_extras_amount: reservation.vat_extras_amount || 0,
                total_amount: reservation.total_amount || 0,
                notes: reservation.notes || "",
                skipper_id: reservation.skipper_id || "",
                marinheiro_id: reservation.marinheiro_id || "",
                extra_hours: reservation.extra_hours || 0,
                selected_activities: (reservation as any).reservation_activities || [],
                selected_food: (reservation as any).reservation_food || [],
                boarding_location: reservation.boarding_location || "Mitrena",
                passengers_adults: reservation.passengers_adults || 1,
                passengers_children: reservation.passengers_children || 0,
                client_address: reservation.client_address || "",
                client_country: reservation.client_country || "Portugal",
            });
        }
    }, [reservation, form]);

    async function onSubmit(values: ReservationFormValues) {
        setLoading(true);
        const result = await updateReservationAction(reservation.id, values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Reserva atualizada com sucesso!");
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[950px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3 text-[#0A1F1C]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-3xl font-bold font-heading">Editar Reserva</DialogTitle>
                            <DialogDescription className="text-[#0A1F1C]/60">
                                Atualize os detalhes da reserva #{reservation?.id?.split('-')[0]}.
                            </DialogDescription>
                        </div>
                        <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">Valor a Pagar</span>
                            <span className="text-3xl font-bold text-[#44C3B2] bg-[#0A1F1C] px-6 py-2 rounded-2xl shadow-xl border border-[#44C3B2]/20 tabular-nums">
                                {Number(form.watch("total_amount") || 0).toFixed(2)}€
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 text-[#0A1F1C]">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                                <User className="h-3 w-3" /> Dados do Cliente
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="client_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome Completo</FormLabel>
                                        <FormControl><Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="client_email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">E-mail</FormLabel>
                                        <FormControl><Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="client_phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Telemóvel</FormLabel>
                                        <FormControl><PhoneInput {...field} /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="client_address" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Morada</FormLabel>
                                        <FormControl><Input {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" /></FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="client_country" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">País</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2]">
                                                    <SelectValue placeholder="Selecione o país" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl max-h-[200px] overflow-y-auto">
                                                {COUNTRIES.map(country => (
                                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" /> Detalhes da Reserva
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="boat_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Embarcação</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>{fleet.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
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
                                )} />
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Data</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl><Button variant="outline" className={cn("w-full rounded-xl border-white/50 bg-white/50 h-10 hover:bg-white/60 text-[#0A1F1C] hover:text-[#0A1F1C] transition-all", !field.value && "text-muted-foreground")}>{field.value ? format(new Date(field.value), "dd/MM/yyyy") : <span>Selecione</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={date => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} locale={pt} initialFocus /></PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="program_id" render={({ field }) => (
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
                                                            {p.name} ({p.duration_hours}h) - {p[`price_${season}`]}€
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>Sem programas disponíveis</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="time" render={({ field }) => (
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
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    className="h-auto py-2.5 px-3 text-[10px] justify-center border border-white/60 bg-white/60 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all rounded-xl font-bold shadow-sm"
                                                    onClick={() => form.setValue("time", "10:00 - 14:00")}
                                                >
                                                    10h — 14h (Manhã)
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    className="h-auto py-2.5 px-3 text-[10px] justify-center border border-white/60 bg-white/60 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all rounded-xl font-bold shadow-sm"
                                                    onClick={() => form.setValue("time", "15:00 - 19:00")}
                                                >
                                                    15h — 19h (Tarde)
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    className="h-auto py-2.5 px-3 text-[10px] justify-center border border-white/60 bg-white/60 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all rounded-xl font-bold shadow-sm"
                                                    onClick={() => form.setValue("time", "10:00 - 18:00")}
                                                >
                                                    10h — 18h (8 Horas)
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    className="h-auto py-2.5 px-3 text-[10px] justify-center border border-white/60 bg-white/60 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all rounded-xl font-bold shadow-sm"
                                                    onClick={() => form.setValue("time", "19:30 - 21:30")}
                                                >
                                                    19h30 — 21h30 (Sunset)
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    className="h-auto py-2.5 px-3 text-[10px] justify-center border border-white/60 bg-white/60 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all rounded-xl font-bold shadow-sm col-span-2"
                                                    onClick={() => form.setValue("time", "10:00 - 16:00")}
                                                >
                                                    10h — 16h (Viagem 6 Horas)
                                                </Button>
                                            </div>
                                        </div>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="total_amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Valor Total (€)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} className="rounded-xl border-white/50 bg-white/50" /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField
                                    control={form.control}
                                    name="passengers_adults"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Adultos</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="passengers_children"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Crianças</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
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
                                <div className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-xl flex items-center gap-2 mt-2">
                                    <X className="h-3 w-3" /> A lotação máxima do barco foi ultrapassada!
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                                <Anchor className="h-3 w-3" /> Atribuição de Equipa
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="skipper_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Skipper</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                            <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="none">Nenhum</SelectItem>{team.filter(m => m.role === 'skipper').map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="marinheiro_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Marinheiro</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                            <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="none">Nenhum</SelectItem>{team.filter(m => m.role === 'marinheiro').map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="extra_hours" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-1"><Clock className="h-2 w-2" /> Horas Extra</FormLabel>
                                        <FormControl><Input type="number" step="0.5" {...field} className="rounded-xl border-white/50 bg-white/50" /></FormControl>
                                    </FormItem>
                                )} />

                                <div className="md:col-span-2 p-3 rounded-2xl bg-[#44C3B2]/5 border border-[#44C3B2]/20 flex items-center justify-between mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Pagamento Estimado</span>
                                    <div className="flex gap-4">
                                        {form.watch("skipper_id") && form.watch("skipper_id") !== "none" && (
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[9px] px-1 h-4 bg-[#0A1F1C]/5 font-black uppercase">S</Badge>
                                                <span className="text-xs font-bold text-[#0A1F1C]">
                                                    €{calculateStaffPayout(
                                                        "skipper",
                                                        detectProgramFromTime(`${boatPrograms.find(p => p.id === form.watch("program_id"))?.name || ""} ${boatPrograms.find(p => p.id === form.watch("program_id"))?.duration_hours || ""}h`),
                                                        Number(form.watch("extra_hours")),
                                                        rates,
                                                        team.find(m => m.id === form.watch("skipper_id"))
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {form.watch("marinheiro_id") && form.watch("marinheiro_id") !== "none" && (
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[9px] px-1 h-4 bg-[#44C3B2]/10 font-black uppercase">M</Badge>
                                                <span className="text-xs font-bold text-[#0A1F1C]">
                                                    €{calculateStaffPayout(
                                                        "marinheiro",
                                                        detectProgramFromTime(`${boatPrograms.find(p => p.id === form.watch("program_id"))?.name || ""} ${boatPrograms.find(p => p.id === form.watch("program_id"))?.duration_hours || ""}h`),
                                                        Number(form.watch("extra_hours")),
                                                        rates,
                                                        team.find(m => m.id === form.watch("marinheiro_id"))
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Structured Extras Section */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                                    <Plus className="h-3 w-3" /> Seleção de Atividades Extra
                                </h4>
                                <div className="space-y-3">
                                    <Select onValueChange={(val) => {
                                        const current = form.getValues("selected_activities") || [];
                                        if (!current.find(a => a.id === val)) {
                                            form.setValue("selected_activities", [...current, { id: val, quantity: 1 }]);
                                        }
                                    }}>
                                        <SelectTrigger className="rounded-xl border-white/50 bg-white/50">
                                            <SelectValue placeholder="Adicionar Extra..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                            {boatExtras.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} (€{a.price})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedActivities.map((item: any) => {
                                            const activity = boatExtras.find(e => e.id === item.id);
                                            return (
                                                <Badge key={item.id} variant="secondary" className="pl-3 pr-1 py-1 h-auto flex items-center gap-2 rounded-full bg-white/80 border-white/50 text-[#0A1F1C]">
                                                    <span className="text-[11px] font-bold">{activity?.name || "Extra (Não encontrado)"}</span>
                                                    <div className="flex items-center bg-[#0A1F1C]/5 rounded-full px-1">
                                                        <button type="button" onClick={() => {
                                                            const next = selectedActivities.map((a: any) =>
                                                                a.id === item.id ? { ...a, quantity: Math.max(1, a.quantity - 1) } : a
                                                            );
                                                            form.setValue("selected_activities", next);
                                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Minus className="h-3 w-3" /></button>
                                                        <span className="text-[10px] w-4 text-center">{item.quantity}</span>
                                                        <button type="button" onClick={() => {
                                                            const next = selectedActivities.map((a: any) =>
                                                                a.id === item.id ? { ...a, quantity: a.quantity + 1 } : a
                                                            );
                                                            form.setValue("selected_activities", next);
                                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Plus className="h-3 w-3" /></button>
                                                    </div>
                                                    <button type="button" onClick={() => {
                                                        form.setValue("selected_activities", selectedActivities.filter((a: any) => a.id !== item.id));
                                                    }} className="h-5 w-5 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        <div className="space-y-4 pt-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                                    <Plus className="h-3 w-3" /> Seleção de Refeições / Catering
                                </h4>
                                <div className="space-y-3">
                                    <Select onValueChange={(val) => {
                                        const current = form.getValues("selected_food") || [];
                                        if (!current.find(f => f.id === val)) {
                                            form.setValue("selected_food", [...current, { id: val, quantity: 1 }]);
                                        }
                                    }}>
                                        <SelectTrigger className="rounded-xl border-white/50 bg-white/50">
                                            <SelectValue placeholder="Adicionar Refeição..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                            {availableFood.map(f => (
                                                <SelectItem key={f.id} value={f.id}>{f.name} (€{f.price})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedFood.map((item: any) => {
                                            const food = availableFood.find(f => f.id === item.id);
                                            return (
                                                <Badge key={item.id} variant="secondary" className="pl-3 pr-1 py-1 h-auto flex items-center gap-2 rounded-full bg-white/80 border-white/50 text-[#0A1F1C]">
                                                    <span className="text-[11px] font-bold">{food?.name}</span>
                                                    <div className="flex items-center bg-[#0A1F1C]/5 rounded-full px-1">
                                                        <button type="button" onClick={() => {
                                                            const next = selectedFood.map((f: any) =>
                                                                f.id === item.id ? { ...f, quantity: Math.max(1, f.quantity - 1) } : f
                                                            );
                                                            form.setValue("selected_food", next);
                                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Minus className="h-3 w-3" /></button>
                                                        <span className="text-[10px] w-4 text-center">{item.quantity}</span>
                                                        <button type="button" onClick={() => {
                                                            const next = selectedFood.map((f: any) =>
                                                                f.id === item.id ? { ...f, quantity: f.quantity + 1 } : f
                                                            );
                                                            form.setValue("selected_food", next);
                                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Plus className="h-3 w-3" /></button>
                                                    </div>
                                                    <button type="button" onClick={() => {
                                                        form.setValue("selected_food", selectedFood.filter((f: any) => f.id !== item.id));
                                                    }} className="h-5 w-5 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Estado</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="rounded-xl border-white/50 bg-white/50"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Confirmado">Confirmado</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 font-bold">Notas / Observações</FormLabel>
                                    <FormControl><Textarea {...field} className="rounded-xl border-white/50 bg-white/50 min-h-[40px]" /></FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C]">Cancelar</Button>
                            <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] font-bold transition-all">
                                {loading ? "A guardar..." : "Guardar Alterações"}
                                <Save className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
