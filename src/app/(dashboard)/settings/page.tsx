import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database } from "lucide-react";
import { AiSettings } from "@/components/settings/ai-settings";
import { AdminProfileDialog, NotificationsDialog, SecurityDialog, AppearanceDialog, BackupDialog, GeneralSettingsDialog } from "@/components/settings/settings-dialogs";
import { RatesSettingsDialog } from "@/components/settings/rates-settings-dialog";
import { getUserProfile } from "@/app/actions/auth";
import { getSystemSettingsAction } from "@/app/actions/settings";
import { getStaffRates } from "@/app/actions/rates";

export const metadata: Metadata = {
    title: "Configurações | GreenBreeze Admin",
    description: "Configurações do Sistema GreenBreeze",
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const { user } = await getUserProfile();
    const { settings } = await getSystemSettingsAction();
    const { rates = [] } = await getStaffRates();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* ... header ... */}
            <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Configurações</h2>
                <p className="text-muted-foreground font-body text-sm text-[#0A1F1C]/60">
                    Gerencie as preferências da sua conta, notificações e definições do sistema.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* ... existing cards ... */}
                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <User className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Perfil do Administrador</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Atualize os seus dados de contacto e acesso.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminProfileDialog initialUser={user}>
                            <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                                Editar Perfil
                            </Button>
                        </AdminProfileDialog>
                    </CardContent>
                </Card>

                {/* Rates Settings */}
                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <SettingsIcon className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Taxas de Pagamento</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Gerir valores de skippers e marinheiros.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RatesSettingsDialog rates={rates} />
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <Bell className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Notificações</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Configure os alertas de novas reservas e stock.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <NotificationsDialog initialNotifications={user?.notifications}>
                            <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                                Gerir Alertas
                            </Button>
                        </NotificationsDialog>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Segurança</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Acesso ao backoffice e chaves de API.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SecurityDialog>
                            <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                                Alterar Password
                            </Button>
                        </SecurityDialog>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <Palette className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Aparência</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Personalize o tema e as cores do Emerald Glass.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AppearanceDialog>
                            <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                                Configurar Tema
                            </Button>
                        </AppearanceDialog>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <Database className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Dados & Backup</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Exportar dados de reservas e estatísticas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BackupDialog>
                            <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                                Exportar CSV
                            </Button>
                        </BackupDialog>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all hover:scale-[1.01] hover:bg-white/50">
                    <CardHeader className="space-y-1">
                        <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center mb-4 shadow-lg shadow-[#0A1F1C]/10">
                            <SettingsIcon className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-heading text-xl text-[#0A1F1C]">Definições Gerais</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Fusos horários, idiomas e detalhes da marina.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GeneralSettingsDialog initialSettings={settings}>
                            <Button variant="outline" className="w-full rounded-xl border-[#0A1F1C]/10 bg-white/20 hover:bg-[#0A1F1C] hover:text-[#44C3B2] transition-all font-bold">
                                Configurar Marina
                            </Button>
                        </GeneralSettingsDialog>
                    </CardContent>
                </Card>
            </div>

            {/* AI Settings Section */}
            <div className="w-full mt-4">
                <AiSettings />
            </div>
        </div>
    );
}
