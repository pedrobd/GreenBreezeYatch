import { Metadata } from "next";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X, Filter } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineMap } from "./timeline-map";
import { Card, CardContent } from "@/components/ui/card";
import { AddReservationDialog } from "@/components/reservations/add-reservation-dialog";
import { ReservationActionsCell } from "@/components/reservations/reservation-actions-cell";
import { ReservationSearch, ReservationTabs, ReservationPagination } from "@/components/reservations/reservation-filters";
import { SortableTableHead } from "@/components/reservations/sortable-table-head";
import { ReservationProvider, ReservationLoadingOverlay } from "@/components/reservations/reservation-context";
import { createClient } from "@supabase/supabase-js";
import { calculateStaffPayout, detectProgramFromTime } from "@/utils/staff-calculations";
import { getStaffRates } from "@/app/actions/rates";

export const metadata: Metadata = {
    title: "Reservas | GreenBreeze Admin",
    description: "Gestão de Reservas GreenBreeze",
};

export const dynamic = 'force-dynamic';

export default async function ReservationsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch fleet to show all boats on the Map Y-axis and for Add Dialog
    const { data: fleet } = await supabaseAdmin
        .from('fleet')
        .select('*')
        .order('name');

    // Parse search params for server-side processing
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams?.page) || 1;
    const limit = 10;
    const tab = (resolvedParams?.tab as string) || 'upcoming';
    const search = (resolvedParams?.search as string) || '';
    const sort = (resolvedParams?.sort as string) || '';
    const order = (resolvedParams?.order as string) || 'desc';

    // Build the query
    let query = supabaseAdmin
        .from('reservations')
        .select(`
            *,
            fleet(name),
            boat_programs(name, duration_hours),
            skipper:team_members!skipper_id(name, role, rate_sunset, rate_half_day, rate_6hour, rate_full_day, rate_extra_hour),
            marinheiro:team_members!marinheiro_id(name, role, rate_sunset, rate_half_day, rate_6hour, rate_full_day, rate_extra_hour),
            reservation_activities(
                activity_id,
                quantity,
                extra_activities(name)
            ),
            reservation_food(
                food_id,
                quantity,
                food_menu(name)
            )
        `, { count: 'exact' });

    // 1. Tab Filtering (Atuais vs Histórico)
    const todayStr = new Date().toISOString().split('T')[0];
    if (tab === 'upcoming') {
        query = query.gte('date', todayStr).neq('status', 'Cancelado');
    } else if (tab === 'pending') {
        query = query.eq('status', 'Pendente');
    } else if (tab === 'history') {
        query = query.or(`date.lt.${todayStr},status.eq.Cancelado`);
    }

    // 2. Search & Filters
    if (search) {
        query = query.or(`client_name.ilike.%${search}%,client_email.ilike.%${search}%`);
    }

    const boatId = resolvedParams?.boatId as string | undefined;
    if (boatId) {
        query = query.eq('boat_id', boatId);
    }

    const activeBoat = boatId ? fleet?.find(b => b.id === boatId) : null;

    // 3. Sorting
    if (sort) {
        const isAsc = order === 'asc';
        if (sort === 'fleet') {
            query = query.order('name', { foreignTable: 'fleet', ascending: isAsc });
        } else if (sort === 'date') {
            query = query.order('date', { ascending: isAsc }).order('time', { ascending: isAsc });
        } else {
            query = query.order(sort, { ascending: isAsc });
        }
    } else {
        const isUpcoming = tab === 'upcoming' || tab === 'pending';
        query = query.order('date', { ascending: isUpcoming })
            .order('time', { ascending: true });
    }

    // 4. Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Run the query
    const { data: reservations, count, error } = await query;
    const { rates = [] } = await getStaffRates();

    if (error) {
        console.error("Error fetching reservations:", JSON.stringify(error, null, 2));
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    function cn(...inputs: any[]) {
        return inputs.filter(Boolean).join(" ");
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Reservas</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie todas as reservas de barcos, estados de pagamento e detalhes dos clientes.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddReservationDialog fleet={fleet || []} />
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-white/40 border border-white/50 backdrop-blur-xl p-1 rounded-2xl">
                        <TabsTrigger value="list" className="rounded-xl px-6 data-[state=active]:bg-[#0A1F1C] data-[state=active]:text-[#44C3B2] data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-wider transition-all">
                            Lista de Reservas
                        </TabsTrigger>
                        <TabsTrigger value="map" className="rounded-xl px-6 data-[state=active]:bg-[#0A1F1C] data-[state=active]:text-[#44C3B2] data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-wider transition-all">
                            Mapa Diário
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="space-y-4 outline-none">
                    <ReservationProvider>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <ReservationTabs />
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {activeBoat && (
                                    <Badge variant="outline" className="bg-[#44C3B2]/10 text-[#0A1F1C] border-[#44C3B2]/30 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 h-10 shadow-sm border">
                                        <Filter className="h-3 w-3 opacity-50" />
                                        <span className="opacity-40">Barco:</span> {activeBoat.name}
                                        <Link href="/reservations" className="hover:bg-[#0A1F1C] hover:text-[#44C3B2] p-1 rounded-lg transition-all ml-1">
                                            <X className="h-3 w-3" />
                                        </Link>
                                    </Badge>
                                )}
                                <ReservationSearch />
                            </div>
                        </div>

                        <div className="relative">
                            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-[#0A1F1C]/5">
                                            <TableRow className="hover:bg-transparent border-white/20">
                                                <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">ID</TableHead>
                                                <SortableTableHead column="client_name" label="Cliente" />
                                                <SortableTableHead column="fleet" label="Barco" />
                                                <SortableTableHead column="date" label="Data" />
                                                <SortableTableHead column="time" label="Horário" />
                                                <SortableTableHead column="status" label="Estado" />
                                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Equipa</TableHead>
                                                <SortableTableHead column="total_amount" label="Valor" className="text-right px-8" />
                                                <TableHead className="w-[80px] py-6 px-8"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reservations?.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground font-body">
                                                        Nenhuma reserva encontrada.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {reservations?.map((reservation: any) => (
                                                <TableRow key={reservation.id} className="group hover:bg-white/30 border-white/10 transition-colors">
                                                    <TableCell className="py-4 px-8">
                                                        <span className="font-bold text-[#0A1F1C] opacity-20 text-[10px] tracking-wider">#{reservation.id.split('-')[0]}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[#0A1F1C] text-sm mb-0.5">{reservation.client_name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{reservation.client_email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-[#0A1F1C]/80 text-sm">{reservation.fleet?.name}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-[#0A1F1C]/70 text-sm">{new Date(reservation.date).toLocaleDateString('pt-PT')}</span>
                                                    </TableCell>
                                                                                                        <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {reservation.boat_programs && (
                                                                <span className="text-[10px] font-medium opacity-50 uppercase tracking-wider">{reservation.boat_programs.name}</span>
                                                            )}
                                                            <span className="text-[11px] font-bold bg-[#0A1F1C]/5 px-2.5 py-1.5 rounded-lg text-[#0A1F1C]/70 w-fit">
                                                                {reservation.time || "-"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={cn(
                                                                "border-none",
                                                                reservation.status === "Confirmado" ? "bg-[#44C3B2]/10 text-[#44C3B2]" : "bg-amber-500/10 text-amber-600"
                                                            )}
                                                            variant="outline"
                                                        >
                                                            {reservation.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {reservation.skipper && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-[#0A1F1C]/10 bg-[#0A1F1C]/5 font-black uppercase">S</Badge>
                                                                    <span className="text-[11px] font-bold text-[#0A1F1C]/80">{reservation.skipper.name}</span>
                                                                    <span className="text-[9px] text-[#44C3B2] font-black">
                                                                        +€{calculateStaffPayout("skipper", detectProgramFromTime(reservation.boat_programs ? `${reservation.boat_programs.name} ${reservation.boat_programs.duration_hours}h` : reservation.time || ""), reservation.extra_hours, rates, reservation.skipper)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {reservation.marinheiro && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-[#0A1F1C]/10 bg-[#44C3B2]/10 font-black uppercase">M</Badge>
                                                                    <span className="text-[11px] font-bold text-[#0A1F1C]/80">{reservation.marinheiro.name}</span>
                                                                    <span className="text-[9px] text-[#44C3B2] font-black">
                                                                        +€{calculateStaffPayout("marinheiro", detectProgramFromTime(reservation.boat_programs ? `${reservation.boat_programs.name} ${reservation.boat_programs.duration_hours}h` : reservation.time || ""), reservation.extra_hours, rates, reservation.marinheiro)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {!reservation.skipper && !reservation.marinheiro && (
                                                                <span className="text-[10px] text-[#0A1F1C]/30 italic font-body">Pendente</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-4 px-8 font-bold text-[#0A1F1C] text-sm tabular-nums">
                                                        €{reservation.total_amount.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-8">
                                                        <ReservationActionsCell reservation={reservation} fleet={fleet || []} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <ReservationPagination currentPage={page} totalPages={totalPages} />
                                </CardContent>
                            </Card>
                            <ReservationLoadingOverlay />
                        </div>
                    </ReservationProvider>
                </TabsContent>

                <TabsContent value="map" className="space-y-4 outline-none">
                    <div className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl p-8 border min-h-[500px]">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-[#0A1F1C] font-heading underline decoration-[#44C3B2]/30 underline-offset-8">Alocação de Frota Diária</h3>
                        </div>
                        <TimelineMap reservations={reservations || []} fleet={fleet || []} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
