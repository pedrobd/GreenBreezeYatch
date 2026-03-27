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
import { Boat, BoatProgram, BoatExtra, FoodItem, ReservationFormValues, TeamMember, StaffRate } from "@/types/admin";
import { reservationSchema } from "@/lib/validations/reservations";
import { ReservationDetailsSection } from "./forms/ReservationDetailsSection";
import { StaffAssignmentSection } from "./forms/StaffAssignmentSection";
import { ExtrasSection } from "./forms/ExtrasSection";
import { ClientInfoSection } from "./forms/ClientInfoSection";
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
import { useReservationPricing } from "./hooks/use-reservation-pricing";
interface EditReservationDialogProps {
    reservation: any; // We keep any for now as the passed object has extra relations not in standard Reservation type
    fleet: Boat[];
    bookedDates: string[];
    availableFood: FoodItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditReservationDialog({ reservation, fleet, open, onOpenChange, availableFood, bookedDates: initialBookedDates }: EditReservationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [rates, setRates] = useState<StaffRate[]>([]);
    const [availableFoodState, setAvailableFoodState] = useState<FoodItem[]>([]);
    const [bookedDates, setBookedDates] = useState<string[]>([]);

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

    useEffect(() => {
        if (open) {
            getReservationDatesAction().then((result: any) => setBookedDates(result.data || []));
            getTeamMembers().then((result: any) => setTeam(result.data || []));
            getStaffRates().then((result: any) => setRates(result.data || []));
            getFoodMenuAction().then((result: any) => setAvailableFoodState(result.data || []));
        }
    }, [open]);

    // Reset form when reservation changes
    useEffect(() => {
        if (reservation) {
            form.reset({
                ...reservation,
                selected_activities: (reservation as any).reservation_activities || [],
                selected_food: (reservation as any).reservation_food || [],
            });
        }
    }, [reservation, form]);

    // Watch form values for calculations
    const selectedBoatId = form.watch("boat_id");
    const selectedActivities = form.watch("selected_activities") || [];
    const selectedFood = form.watch("selected_food") || [];
    const selectedBoardingLocation = form.watch("boarding_location");
    const passengersAdults = form.watch("passengers_adults");
    const passengersChildren = form.watch("passengers_children");

    const selectedBoat = fleet.find(b => b.id === selectedBoatId);
    const totalPassengers = (Number(passengersAdults) || 0) + (Number(passengersChildren) || 0);
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
        availableFood: availableFoodState.length > 0 ? availableFoodState : (availableFood || []),
        enabled: open,
        isEdit: true
    });

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
                        {/* Client Info Section */}
                        <ClientInfoSection />

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
                            availableFood={availableFoodState.length > 0 ? availableFoodState : (availableFood || [])}
                        />

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
