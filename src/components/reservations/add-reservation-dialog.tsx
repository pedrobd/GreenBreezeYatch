"use client";
import { useState, useEffect } from "react";
import { UseFormReturn, Control, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Calendar as CalendarIcon, Clock, Euro, User, Mail, Phone, FileText, Trash2, Minus, X, Anchor, Users } from "lucide-react";
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
    DialogTrigger,
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
import { PhoneInput } from "@/components/ui/phone-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { reservationSchema } from "@/lib/validations/reservations";
import {
    createReservationAction,
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
import { Boat, BoatProgram, BoatExtra, FoodItem, ReservationFormValues, TeamMember, StaffRate } from "@/types/admin";
import { ClientInfoSection } from "./forms/ClientInfoSection";
import { useReservationPricing } from "./hooks/use-reservation-pricing";
import { ReservationDetailsSection } from "./forms/ReservationDetailsSection";
import { StaffAssignmentSection } from "./forms/StaffAssignmentSection";
import { ExtrasSection } from "./forms/ExtrasSection";

interface AddReservationDialogProps {
    fleet: Boat[];
}

export function AddReservationDialog({ fleet }: AddReservationDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [availableFood, setAvailableFood] = useState<FoodItem[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [rates, setRates] = useState<StaffRate[]>([]);


    useEffect(() => {
        if (open) {
            getReservationDatesAction().then((result) => setBookedDates(result.data || []));
            getFoodMenuAction().then((result) => setAvailableFood((result.data as FoodItem[]) || []));
            getTeamMembers().then((result) => setTeam('team' in result ? result.team as TeamMember[] : []));
            getStaffRates().then((result) => setRates('rates' in result ? result.rates as StaffRate[] : []));
        }
    }, [open]);

    const form = useForm<ReservationFormValues>({
        resolver: zodResolver(reservationSchema) as any,
        defaultValues: {
            client_name: "",
            client_email: "",
            client_phone: "",
            boat_id: "",
            program_id: "",
            date: new Date().toISOString().split('T')[0],
            status: "Pendente",
            total_amount: 0,
            notes: "",
            selected_activities: [],
            selected_food: [],
            boarding_location: "Mitrena",
            passengers_adults: 1,
            passengers_children: 0,
            client_address: "",
            client_country: "Portugal",
            skipper_id: "",
            marinheiro_id: "",
            extra_hours: 0,
            payment_method: "",
            payment_status: "Pendente",
        },
    });

    // Watch form values for calculations with explicit types
    const selectedBoatId = useWatch({ control: form.control, name: "boat_id" }) as string;
    const selectedDate = useWatch({ control: form.control, name: "date" }) as string;
    const selectedProgramId = useWatch({ control: form.control, name: "program_id" }) as string;
    const selectedBoardingLocation = useWatch({ control: form.control, name: "boarding_location" }) as string;
    const passengersAdults = useWatch({ control: form.control, name: "passengers_adults" }) as number;
    const passengersChildren = useWatch({ control: form.control, name: "passengers_children" }) as number;
    const selectedActivities = (useWatch({ control: form.control, name: "selected_activities" }) || []) as NonNullable<ReservationFormValues["selected_activities"]>;
    const selectedFood = (useWatch({ control: form.control, name: "selected_food" }) || []) as NonNullable<ReservationFormValues["selected_food"]>;

    const selectedBoat = fleet.find(b => b.id === selectedBoatId);
    const isPartner = selectedBoat?.is_partner || false;
    const totalPassengers = (Number(passengersAdults) || 0) + (Number(passengersChildren) || 0);

    const { boatPrograms, boatExtras, season } = useReservationPricing({
        form,
        selectedBoatId,
        selectedDate,
        selectedProgramId,
        selectedActivities,
        selectedFood,
        selectedBoardingLocation,
        totalPassengers,
        isPartner,
        selectedBoat: selectedBoat ?? null,
        availableFood,
        enabled: open
    });

    const onSubmit = async (values: ReservationFormValues) => {
        setLoading(true);
        const result = await createReservationAction(values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Reserva criada com sucesso!");
            setOpen(false);
            form.reset();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                    <Plus className="mr-2 h-5 w-5" /> Nova Reserva
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[950px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3 text-[#0A1F1C]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-3xl font-bold font-heading">Nova Reserva</DialogTitle>
                            <DialogDescription className="text-[#0A1F1C]/60">
                                Introduza manualmente os detalhes de uma reserva recebida por contacto direto.
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
                        {/* Client Info Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                                <User className="h-3 w-3" /> Dados do Cliente
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    name="client_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: João Silva" {...field} className="focus-visible:ring-[#44C3B2]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="client_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="cliente@email.com" {...field} className="focus-visible:ring-[#44C3B2]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="client_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Telemóvel</FormLabel>
                                            <FormControl>
                                                <PhoneInput {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="client_address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Morada</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Rua, Número, Andar..." {...field} className="focus-visible:ring-[#44C3B2]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="client_country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">País</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-[#44C3B2]">
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
                                    )}
                                />
                            </div>
                        </div>

                        {/* Reservation Details Section */}
                        <div className="space-y-4 pt-2">
                            <ReservationDetailsSection 
                                fleet={fleet}
                                boatPrograms={boatPrograms}
                                bookedDates={bookedDates}
                                season={season}
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <StaffAssignmentSection 
                                team={team}
                                rates={rates}
                                boatPrograms={boatPrograms}
                            />
                        </div>

                        {/* Structured Extras Section */}
                        <ExtrasSection 
                            boatExtras={boatExtras}
                            availableFood={availableFood}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-[#44C3B2]">
                                                    <SelectValue placeholder="Selecione o estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="Pendente">Pendente</SelectItem>
                                                <SelectItem value="Confirmado">Confirmado</SelectItem>
                                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Notas / Observações</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Detalhes adicionais..." {...field} className="focus-visible:ring-[#44C3B2] min-h-[40px]" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Método de Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-[#44C3B2]">
                                                    <SelectValue placeholder="Selecione o método" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="MBWay">MBWay</SelectItem>
                                                <SelectItem value="Multibanco">Multibanco</SelectItem>
                                                <SelectItem value="Transferência">Transferência</SelectItem>
                                                <SelectItem value="Numerário">Numerário / Loja</SelectItem>
                                                <SelectItem value="Cartão">Cartão Crédito/Débito</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="payment_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Estado do Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="focus:ring-[#44C3B2]">
                                                    <SelectValue placeholder="Estado..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                                                <SelectItem value="Pendente">Aguardando Pagamento</SelectItem>
                                                <SelectItem value="Pago">Pago</SelectItem>
                                                <SelectItem value="Parcial">Pago Parcialmente</SelectItem>
                                                <SelectItem value="Falhou">Falhou / Cancelado</SelectItem>
                                                <SelectItem value="Reembolsado">Reembolsado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                            <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                                {loading ? "A processar..." : "Criar Reserva"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
