import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, CalendarDays, UtensilsCrossed, Activity, ArrowUpRight } from "lucide-react";
import { createAdminClient } from "@/utils/supabase/admin";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import Link from "next/link";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { pt } from "date-fns/locale";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { user } = await getUserProfile();

  if (user?.role === "skipper" || user?.role === "marinheiro") {
    redirect("/reservations");
  }

  const supabase = createAdminClient();

  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

    const envData = {
      URL: !!supabaseUrl,
      URL_LEN: supabaseUrl?.length || 0,
      SERVICE_KEY: !!supabaseServiceKey,
      SERVICE_KEY_LEN: supabaseServiceKey?.length || 0,
      ANON_KEY: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || "N/A"
    };

    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-6 text-center p-6">
        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-[#0A1F1C]">Erro de Configuração</h2>
            <p className="max-w-md text-muted-foreground mx-auto">
              O servidor Next.js não está a conseguir ler as chaves da Vercel.
            </p>
        </div>

        <div className="w-full max-w-lg bg-red-50 border border-red-200 rounded-2xl p-6 text-left font-mono text-xs">
            <p className="font-bold text-red-600 mb-4 border-bottom border-red-100 pb-2">DIAGNÓSTICO TÉCNICO:</p>
            <pre className="space-y-1">
                {JSON.stringify(envData, null, 2)}
            </pre>
        </div>

        <div className="space-y-4">
            <p className="text-sm font-medium text-amber-600">⚠️ Atenção: Vi um ícone de alerta cor-de-laranja nos teus prints da Vercel.</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clica nesse ícone na Vercel para ver o aviso. Garante que as chaves não têm espaços invisíveis no início ou fim.
              <br/><br/>
              <strong>Passo de Limpeza:</strong> Tenta apagar a `NEXT_PUBLIC_SUPABASE_URL` na Vercel e criá-la de novo (Add), escrevendo o nome à mão. Desta vez, faz **Redeploy SEM usar Cache**.
            </p>
        </div>
      </div>
    );
  }

  // Fetch basic stats
  const { count: pendingReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pendente');

  const { count: availableBoats } = await supabase
    .from('fleet')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Disponível');

  const { count: totalBoats } = await supabase
    .from('fleet')
    .select('*', { count: 'exact', head: true });

  const { count: foodOrders } = await supabase
    .from('food_menu')
    .select('*', { count: 'exact', head: true });

  const { count: activeActivities } = await supabase
    .from('extra_activities')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Disponível');

  // Fetch upcoming departures (next 3)
  const today = new Date().toISOString().split('T')[0];
  const { data: upcoming } = await supabase
    .from('reservations')
    .select(`
            *,
            fleet (name)
        `)
    .gte('date', today)
    .neq('status', 'Cancelado')
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(3);

  // Prepare chart data (last 7 days of revenue)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const { data: recentRevenue } = await supabase
    .from('reservations')
    .select('date, total_amount')
    .gte('date', format(last7Days[0], 'yyyy-MM-dd'))
    .eq('status', 'Confirmado');

  const chartData = last7Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTotal = recentRevenue
      ?.filter(r => r.date === dateStr)
      .reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

    return {
      date: format(day, 'dd/MM'),
      amount: dayTotal
    };
  });

  const stats = [
    { title: "Reservas Pendentes", value: pendingReservations || "0", sub: "Aguardam confirmação", icon: CalendarDays },
    { title: "Barcos Disponíveis", value: availableBoats || "0", sub: `De um total de ${totalBoats || 0}`, icon: Ship },
    { title: "Menu de Catering", value: foodOrders || "0", sub: "Pratos e Opções", icon: UtensilsCrossed },
    { title: "Atividades Ativas", value: activeActivities || "0", sub: "Experiências na Marina", icon: Activity },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Dashboard</h2>
        <p className="text-muted-foreground font-body text-sm">
          Bem-vindo ao centro de controlo da GreenBreeze. Aqui está o resumo da sua operação.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group relative overflow-hidden rounded-[2rem] border-white/50 bg-white/40 shadow-xl shadow-black/5 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#44C3B2]/10 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1F1C]/40 font-body">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[#0A1F1C]/30" />
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-[#0A1F1C] font-heading mb-2">{stat.value}</div>
              <p className="text-[10px] font-bold text-[#44C3B2] uppercase tracking-wider flex items-center gap-1">
                {stat.sub}
              </p>
              <stat.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-[#0A1F1C]/5 rotate-12 transition-transform group-hover:rotate-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Grid: Overview & Timeline */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-4 rounded-[2.5rem] border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden group">
          <CardHeader className="pb-0 pt-8 px-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-[#0A1F1C] font-heading">Fluxo de Receita</CardTitle>
                <p className="text-xs text-muted-foreground font-body mt-1">Faturação confirmada nos últimos 7 dias</p>
              </div>
              <Link href="/reservations" className="h-10 w-10 rounded-full bg-[#0A1F1C] text-white flex items-center justify-center transition-transform hover:rotate-45 shadow-lg">
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Upcoming Departures */}
        <Card className="col-span-1 lg:col-span-3 rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden">
          <CardHeader className="pt-8 px-8 pb-4">
            <CardTitle className="text-2xl font-bold text-[#0A1F1C] font-heading underline decoration-[#44C3B2]/30 underline-offset-8">Próximas Partidas</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              {!upcoming || upcoming.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground font-body">
                  Sem partidas agendadas para breve.
                </div>
              ) : (
                upcoming.map((departure, i) => (
                  <div key={i} className="flex items-center group/item cursor-pointer p-4 rounded-2xl hover:bg-white/50 transition-all border border-transparent hover:border-white/80">
                    <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center font-bold text-lg font-heading shadow-lg shadow-[#0A1F1C]/10 shrink-0">
                      {departure.client_name.charAt(0)}
                    </div>
                    <div className="ml-4 space-y-0.5 min-w-0">
                      <p className="text-sm font-bold text-[#0A1F1C] font-body truncate">{departure.client_name}</p>
                      <p className="text-[10px] text-[#44C3B2] font-bold uppercase tracking-tighter truncate">
                        {departure.fleet?.name || "Barco"} - {departure.time.split(' ')[0]}
                      </p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <p className="text-[11px] font-bold text-[#0A1F1C] opacity-60 font-body">
                        {format(new Date(departure.date), "dd MMM", { locale: pt })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/reservations">
              <button className="w-full mt-6 py-4 rounded-2xl bg-white border border-[#0A1F1C]/10 text-xs font-black uppercase tracking-widest text-[#0A1F1C] hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-colors shadow-sm">
                Ver Todas as Reservas
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
