import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/utils/supabase/admin";
import { RevenueByBoatChart, StatusDistributionChart, TopInsightsList } from "@/components/analytics/analytics-charts";
import { ExportButton } from "@/components/analytics/export-button";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import { Euro, TrendingUp, Navigation, CalendarX2, Ship, UtensilsCrossed } from "lucide-react";
import { subDays, format } from "date-fns";
import { redirect } from "next/navigation";

import { getUserProfile } from "@/app/actions/auth";
import { calculateStaffPayout, detectProgramFromTime } from "@/utils/staff-calculations";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur-xl transition-all animate-in fade-in duration-500">
                <div className="text-center space-y-4">
                    <p className="text-red-600 font-bold text-xl font-heading tracking-tight">Não autorizado.</p>
                    <p className="text-[#0A1F1C]/60 text-sm font-body">Apenas administradores podem visualizar as estatísticas da GreenBreeze.</p>
                </div>
            </div>
        );
    }

    const supabase = createAdminClient();

    // Parse search params for date filtering
    const resolvedParams = await searchParams;
    const fromParam = resolvedParams?.from as string | undefined;
    const toParam = resolvedParams?.to as string | undefined;

    // Default to last 30 days if no params
    const defaultFromDate = subDays(new Date(), 30);
    const fromDate = fromParam ? new Date(fromParam) : defaultFromDate;
    const toDate = toParam ? new Date(toParam) : new Date();

    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    const toDateStr = format(toDate, 'yyyy-MM-dd');

    // Fetch all reservations within date range
    const { data: reservations } = await supabase
        .from('reservations')
        .select(`
            *,
            fleet (name),
            boat_programs (name, duration_hours),
            reservation_activities (
                quantity,
                extra_activities (name)
            ),
            reservation_food (
                quantity,
                food_menu (name)
            ),
            booking_sources (name),
            skipper:team_members!skipper_id(name),
            marinheiro:team_members!marinheiro_id(name)
        `)
        .gte('date', fromDateStr)
        .lte('date', toDateStr)
        .order('date', { ascending: false });

    // Fetch team and rates for crew payout calculations
    const { data: teamData } = await supabase.from('team_members').select('*');
    const { data: ratesData } = await supabase.from('staff_rates').select('*');

    const team = teamData || [];
    const rates = ratesData || [];

    const safeReservations = reservations || [];

    // Calculate generic stats
    const totalRevenue = safeReservations
        .filter(r => r.status === 'Confirmado')
        .reduce((sum, r) => sum + (r.total_amount || 0), 0);

    const totalReservations = safeReservations.length;
    const confirmedReservations = safeReservations.filter(r => r.status === 'Confirmado').length;
    const cancelledReservations = safeReservations.filter(r => r.status === 'Cancelado').length;

    const averageTicket = confirmedReservations > 0 ? (totalRevenue / confirmedReservations) : 0;

    // Calculate revenue by boat
    const revenueByBoatMap = new Map<string, number>();
    const tripsByBoatMap = new Map<string, number>();

    // Calculate food and activity counts
    const foodCountMap = new Map<string, number>();
    const activityCountMap = new Map<string, number>();

    // Calculate crew payouts
    const skipperRevenueMap = new Map<string, number>();
    const marinheiroRevenueMap = new Map<string, number>();

    safeReservations.forEach(r => {
        // Status checks
        const status = r.status || "Pendente";

        // Only count revenue and trips for confirmed or completed
        if (status === 'Confirmado') {
            const boatName = r.fleet?.name || "Desconhecido";
            const amount = r.total_amount || 0;
            revenueByBoatMap.set(boatName, (revenueByBoatMap.get(boatName) || 0) + amount);
            tripsByBoatMap.set(boatName, (tripsByBoatMap.get(boatName) || 0) + 1);

            // Calculate Crew Revenue
            const programName = r.boat_programs ? `${r.boat_programs.name} ${r.boat_programs.duration_hours}h` : r.time || "";
            const programCode = detectProgramFromTime(programName);

            if (r.skipper_id) {
                const skipper = team.find(m => m.id === r.skipper_id);
                if (skipper) {
                    const payout = calculateStaffPayout('skipper', programCode, r.extra_hours || 0, rates, skipper);
                    skipperRevenueMap.set(skipper.name, (skipperRevenueMap.get(skipper.name) || 0) + payout);
                }
            }

            if (r.marinheiro_id) {
                const marinheiro = team.find(m => m.id === r.marinheiro_id);
                if (marinheiro) {
                    const payout = calculateStaffPayout('marinheiro', programCode, r.extra_hours || 0, rates, marinheiro);
                    marinheiroRevenueMap.set(marinheiro.name, (marinheiroRevenueMap.get(marinheiro.name) || 0) + payout);
                }
            }
        }

        // Count food (all non-cancelled)
        if (status !== 'Cancelado' && r.reservation_food) {
            r.reservation_food.forEach((rf: any) => {
                const name = rf.food_menu?.name || "Desconhecido";
                foodCountMap.set(name, (foodCountMap.get(name) || 0) + (rf.quantity || 1));
            });
        }

        // Count activities (all non-cancelled)
        if (status !== 'Cancelado' && r.reservation_activities) {
            r.reservation_activities.forEach((ra: any) => {
                const name = ra.extra_activities?.name || "Desconhecido";
                activityCountMap.set(name, (activityCountMap.get(name) || 0) + (ra.quantity || 1));
            });
        }
    });

    const revenueByBoatData = Array.from(revenueByBoatMap.entries()).map(([name, revenue]) => ({
        name,
        revenue
    })).sort((a, b) => b.revenue - a.revenue);

    // Prepare Top Insights Data
    const topBoatsData = Array.from(tripsByBoatMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const topFoodData = Array.from(foodCountMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const topActivitiesData = Array.from(activityCountMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const topSkippersData = Array.from(skipperRevenueMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const topMarinheirosData = Array.from(marinheiroRevenueMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Calculate status distribution
    const statusCountMap = new Map<string, number>();
    safeReservations.forEach(r => {
        const status = r.status || "Pendente";
        statusCountMap.set(status, (statusCountMap.get(status) || 0) + 1);
    });

    const statusDistributionData = Array.from(statusCountMap.entries()).map(([name, value]) => ({
        name,
        value
    }));

    const stats = [
        { title: "Receita Total Bruta", value: `€${totalRevenue.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`, sub: "Todas as reservas confirmadas", icon: Euro },
        { title: "Ticket Médio", value: `€${averageTicket.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`, sub: "Por reserva confirmada", icon: TrendingUp },
        { title: "Taxa de Conversão", value: `${totalReservations > 0 ? Math.round((confirmedReservations / totalReservations) * 100) : 0}%`, sub: `${confirmedReservations} reservas confirmadas`, icon: Navigation },
        { title: "Taxa de Cancelamento", value: `${totalReservations > 0 ? Math.round((cancelledReservations / totalReservations) * 100) : 0}%`, sub: `${cancelledReservations} reservas canceladas`, icon: CalendarX2 },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Estatísticas</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Análise detalhada do desempenho filtrada por data.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                    <div className="flex-1 w-full sm:w-auto">
                        <DateRangePicker />
                    </div>
                    <ExportButton data={safeReservations} filename="reservas-greenbreeze" />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="group relative overflow-hidden rounded-[2rem] border-white/50 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all hover:scale-[1.02] border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1F1C]/40 font-body">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-[#0A1F1C]/30" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl lg:text-4xl font-bold text-[#0A1F1C] font-heading mb-1">{stat.value}</div>
                            <p className="text-[10px] font-bold text-[#44C3B2] uppercase tracking-wider flex items-center gap-1">
                                {stat.sub}
                            </p>
                            <stat.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-[#0A1F1C]/5 rotate-12 transition-transform group-hover:rotate-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Secondary Grid: Top Insights */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Boats */}
                <Card className="rounded-[2rem] border-white/50 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-[#0A1F1C] font-heading">Top Embarcações</CardTitle>
                            <Ship className="h-4 w-4 text-[#0A1F1C]/40" />
                        </div>
                        <p className="text-xs text-muted-foreground font-body">Viagens realizadas</p>
                    </CardHeader>
                    <CardContent>
                        <TopInsightsList items={topBoatsData} />
                    </CardContent>
                </Card>



                {/* Top Food */}
                <Card className="rounded-[2rem] border-white/50 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-[#0A1F1C] font-heading">Top Menus</CardTitle>
                            <UtensilsCrossed className="h-4 w-4 text-[#0A1F1C]/40" />
                        </div>
                        <p className="text-xs text-muted-foreground font-body">Opções de catering populares</p>
                    </CardHeader>
                    <CardContent>
                        <TopInsightsList items={topFoodData} />
                    </CardContent>
                </Card>
            </div>

            {/* Crew Revenue Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Skippers */}
                <Card className="rounded-[2rem] border-white/50 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-[#0A1F1C] font-heading">Faturação Skpippers</CardTitle>
                            <span className="h-4 w-4 flex items-center justify-center text-[10px] font-bold text-[#0A1F1C]/40">€</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-body">Receita individual gerada por capitães</p>
                    </CardHeader>
                    <CardContent>
                        <TopInsightsList items={topSkippersData} formatAsCurrency={true} />
                    </CardContent>
                </Card>

                {/* Top Marinheiros */}
                <Card className="rounded-[2rem] border-white/50 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-[#0A1F1C] font-heading">Faturação Marinheiros</CardTitle>
                            <span className="h-4 w-4 flex items-center justify-center text-[10px] font-bold text-[#0A1F1C]/40">€</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-body">Receita individual gerada por marinheiros</p>
                    </CardHeader>
                    <CardContent>
                        <TopInsightsList items={topMarinheirosData} formatAsCurrency={true} />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue by Boat Chart */}
                <Card className="col-span-1 lg:col-span-4 rounded-[2.5rem] border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="pt-8 px-8 pb-4">
                        <CardTitle className="text-2xl font-bold text-[#0A1F1C] font-heading">Receita por Embarcação</CardTitle>
                        <p className="text-xs text-muted-foreground font-body mt-1">Comparação de faturação financeira.</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <RevenueByBoatChart data={revenueByBoatData} />
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="col-span-1 lg:col-span-3 rounded-[2.5rem] border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="pt-8 px-8 pb-4">
                        <CardTitle className="text-2xl font-bold text-[#0A1F1C] font-heading">Estado das Reservas</CardTitle>
                        <p className="text-xs text-muted-foreground font-body mt-1">Distribuição percentual de estados.</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex justify-center items-center">
                        <StatusDistributionChart data={statusDistributionData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
