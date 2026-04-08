"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, User, Clock, Euro, Save, Anchor, Users, Plus, Minus, X, FileText, Trash2 } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    deleteReservationAction,
    getReservationDatesAction,
    getFoodMenuAction
} from "@/app/actions/reservations";
import { getBoatProgramsAction, getBoatExtrasAction } from "@/app/actions/fleet";
import { getExtrasAction } from "@/app/actions/extras";
import { getTeamMembers } from "@/app/actions/team";
import { getStaffRates } from "@/app/actions/rates";
import { useReservationPricing } from "./hooks/use-reservation-pricing";
/** Reservation row with Supabase joined relation arrays. */
interface ReservationWithRelations {
    id: string;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    boat_id?: string;
    program_id?: string;
    date?: string;
    time?: string;
    status?: "Pendente" | "Confirmado" | "Cancelado";
    subtotal_amount?: number;
    extras_amount?: number;
    vat_base_amount?: number;
    vat_extras_amount?: number;
    total_amount?: number;
    notes?: string;
    skipper_id?: string;
    marinheiro_id?: string;
    extra_hours?: number;
    boarding_location?: string;
    passengers_adults?: number;
    passengers_children?: number;
    client_address?: string;
    client_country?: string;
    payment_method?: string;
    payment_status?: string;
    /** Joined via Supabase select */
    reservation_food?: Array<{ id: string; quantity: number | null; food_id?: string; [key: string]: unknown }>;
    reservation_activities?: Array<{ id: string; quantity: number | null; activity_id?: string; [key: string]: unknown }>;
}

interface EditReservationDialogProps {
    reservation: ReservationWithRelations;
    fleet: Boat[];
    bookedDates: string[];
    availableFood: FoodItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditReservationDialog({ reservation, fleet, open, onOpenChange, availableFood, bookedDates: initialBookedDates }: EditReservationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [rates, setRates] = useState<StaffRate[]>([]);
    
    console.log('--- RESERVATION EXTRAS DEBUG ---');
    console.log('reservation_activities:', JSON.stringify(reservation?.reservation_activities, null, 2));
    console.log('reservation_food:', JSON.stringify(reservation?.reservation_food, null, 2));
    console.log('-------------------------------');

    const [availableFoodState, setAvailableFoodState] = useState<FoodItem[]>(availableFood || []);
    const [bookedDates, setBookedDates] = useState<string[]>(initialBookedDates || []);

    const form = useForm<ReservationFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            selected_extras: (reservation?.reservation_activities || []).map((a: any) => ({ 
                id: a.activity_id || a.id, 
                quantity: a.quantity || 1 
            })),
            selected_food: (reservation?.reservation_food || []).map((f: any) => ({ 
                id: f.food_id || f.id, 
                quantity: f.quantity || 1 
            })),
            boarding_location: reservation?.boarding_location || "Mitrena",
            passengers_adults: reservation?.passengers_adults || 1,
            passengers_children: reservation?.passengers_children || 0,
            client_address: reservation?.client_address || "",
            client_country: reservation?.client_country || "Portugal",
        },
    });

    useEffect(() => {
        if (open) {
            getReservationDatesAction().then(result => setBookedDates(result.data || []));
            getTeamMembers().then(result => setTeam('team' in result ? result.team as TeamMember[] : []));
            getStaffRates().then(result => setRates('rates' in result ? result.rates as StaffRate[] : []));
            getFoodMenuAction().then(result => setAvailableFoodState((result.data as FoodItem[]) || []));
        }
    }, [open]);

    // Reset form when reservation changes
    useEffect(() => {
        if (reservation) {
            form.reset({
                client_name: reservation.client_name || "",
                client_email: reservation.client_email || "",
                client_phone: reservation.client_phone || "",
                boat_id: reservation.boat_id || "",
                program_id: reservation.program_id || "",
                date: reservation.date || "",
                time: reservation.time || "",
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
                selected_extras: (reservation.reservation_activities || []).map((a: any) => ({ 
                    id: a.activity_id || a.id, 
                    quantity: a.quantity || 1 
                })),
                selected_food: (reservation.reservation_food || []).map((f: any) => ({ 
                    id: f.food_id || f.id, 
                    quantity: f.quantity || 1 
                })),
                boarding_location: reservation.boarding_location || "Mitrena",
                passengers_adults: reservation.passengers_adults || 1,
                passengers_children: reservation.passengers_children || 0,
                client_address: reservation.client_address || "",
                client_country: reservation.client_country || "Portugal",
            });
        }
    }, [reservation, form]);

    // Watch form values for calculations
    const selectedBoatId = form.watch("boat_id");
    const selectedExtras = form.watch("selected_extras") || [];
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
        selectedExtras,
        selectedFood,
        selectedBoardingLocation,
        totalPassengers,
        isPartner,
        selectedBoat: selectedBoat ?? null,
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
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70">Estado</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Confirmado">Confirmado</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/70 font-bold">Notas / Observações</FormLabel>
                                    <FormControl><Textarea {...field} className="min-h-[40px]" /></FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={() => setDeleteDialogOpen(true)} 
                                disabled={loading}
                                className="h-12 rounded-2xl px-6 font-bold flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Eliminar</span>
                            </Button>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl border-none bg-black/5 px-6 font-bold text-[#0A1F1C]">Voltar</Button>
                                <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0A1F1C]/20">
                                    {loading ? "A guardar..." : "Guardar Alterações"}
                                    <Save className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
                            <Trash2 className="h-6 w-6" />
                            Confirmar Eliminação
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#0A1F1C]/70 text-base">
                            Esta ação é <strong>irreversível</strong>. Todos os dados desta reserva serão removidos definitivamente da base de dados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="h-12 rounded-2xl border-none bg-black/5 px-6 font-bold text-[#0A1F1C] hover:bg-black/10 transition-all">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={async () => {
                                setLoading(true);
                                const res = await deleteReservationAction(reservation.id);
                                setLoading(false);
                                setDeleteDialogOpen(false);
                                if (res.error) toast.error(res.error);
                                else {
                                    toast.success("Reserva eliminada.");
                                    onOpenChange(false);
                                }
                            }}
                            className="h-12 rounded-2xl bg-red-600 px-6 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                            {loading ? "A eliminar..." : "Sim, eliminar agora"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
