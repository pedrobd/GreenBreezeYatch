import Image from "next/image";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { WeatherWidget } from "@/components/weather-widget";
import { Clock } from "@/components/clock";
import { getUserProfile } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getUserProfile();
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    booking_manager: "Gestor de Reservas",
    skipper: "Skipper",
    marinheiro: "Marinheiro"
  };

  return (
    <div className="relative min-h-screen bg-[#F4F1EA] selection:bg-[#44C3B2]/30 selection:text-[#0A1F1C]">
      {/* Background Layer with blurred boat for depth */}
      <div
        className="fixed inset-0 z-0 opacity-20 blur-[100px] pointer-events-none"
        style={{ backgroundImage: "url('/boat-login.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Floating Top Navigation Bar */}
        <header className="sticky top-4 z-50 mx-4 lg:mx-8 mt-4 flex h-20 items-center gap-4 rounded-2xl border border-white/40 bg-white/70 px-6 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(10,31,28,0.05)] transition-all">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="/favicon.png"
                alt="GreenBreeze Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0A1F1C] font-heading tracking-tight leading-none uppercase">GreenBreeze</span>
              <span className="text-[10px] font-bold text-[#44C3B2] uppercase tracking-[0.2em] leading-none mt-1">
                {user?.role ? roleLabels[user.role] : "Acesso Restrito"}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-6">
            <Clock />

            <div className="h-8 w-px bg-[#0A1F1C]/10" />

            <div className="flex flex-col items-end shrink-0">
              <span className="text-xs font-bold text-[#0A1F1C] opacity-40 uppercase tracking-[0.2em]">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#44C3B2] animate-pulse shrink-0" />
                <span className="text-[10px] font-bold text-[#44C3B2] uppercase tracking-wider whitespace-nowrap">
                  SISTEMA OPERACIONAL
                </span>
              </div>
            </div>
            <UserNav />
          </div>
        </header>

        <div className="flex flex-1 items-start p-4 lg:p-8 gap-8">
          {/* Floating Sidebar Navigation - Island Style */}
          <aside className="sticky top-32 z-30 hidden h-[calc(100vh-10rem)] w-72 shrink-0 md:block">
            <div className="flex flex-col h-full rounded-3xl border border-white/50 bg-[#0A1F1C]/90 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(10,31,28,0.15)] relative group">
              {/* Subtle accent light in sidebar */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#44C3B2]/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex flex-col h-full z-10">
                <div className="mb-4 px-2 shrink-0">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#44C3B2]/50 mb-4">Navegação Principal</h3>
                </div>

                <div className="flex-1 px-2">
                  <SidebarNav role={user?.role} />
                </div>

                <div className="mt-4 shrink-0">
                  <WeatherWidget />
                </div>
              </div>
            </div>
          </aside>

          {/* Page Content Area */}
          <main className="flex-1 w-full relative">
            <div className="max-w-[1800px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
