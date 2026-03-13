"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// Admin Profile Dialog
export function AdminProfileDialog({
    children,
    initialUser
}: {
    children: React.ReactNode;
    initialUser?: any;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const { updateUserProfileAction } = await import("@/app/actions/auth");
        const result = await updateUserProfileAction(formData);

        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Perfil atualizado com sucesso!");
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl dark:bg-black/80 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C] dark:text-white">Perfil do Administrador</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 dark:text-white/60 text-xs">
                        Faça alterações ao seu perfil aqui. Clique em guardar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Nome Completo</Label>
                            <Input id="name" name="name" defaultValue={initialUser?.name || ""} placeholder="O seu nome completo" className="rounded-xl border-white/50 bg-white/50 focus:bg-white dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Endereço de Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={initialUser?.email || ""} placeholder="nome@exemplo.com" className="rounded-xl border-white/50 bg-white/50 focus:bg-white dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Contacto Telefónico</Label>
                            <Input id="phone" name="phone" defaultValue="+351 912 345 678" className="rounded-xl border-white/50 bg-white/50 focus:bg-white dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                    </div>
                    <DialogFooter className="mt-8 flex items-center gap-3 sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Guardar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Notifications Dialog
export function NotificationsDialog({
    children,
    initialNotifications
}: {
    children: React.ReactNode,
    initialNotifications?: any
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Controlled state for switches
    const [emailBookings, setEmailBookings] = useState(initialNotifications?.email_bookings ?? true);
    const [systemAlerts, setSystemAlerts] = useState(initialNotifications?.system_alerts ?? true);
    const [marketing, setMarketing] = useState(initialNotifications?.marketing ?? false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            email_bookings: emailBookings,
            system_alerts: systemAlerts,
            marketing: marketing
        };

        const { updateUserNotificationsAction } = await import("@/app/actions/auth");
        const result = await updateUserNotificationsAction(payload);

        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Preferências de notificação atualizadas!");
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl dark:bg-black/80 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C] dark:text-white">Notificações</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 dark:text-white/60 text-xs">
                        Escolha o que pretende receber no seu email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <div className="grid gap-6 py-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="notif_bookings" className="flex flex-col space-y-1">
                                <span className="text-sm font-bold text-[#0A1F1C] dark:text-white">Novas Reservas</span>
                                <span className="font-normal text-[10px] text-[#0A1F1C]/60 dark:text-white/60">Seja notificado sempre que houver uma nova reserva.</span>
                            </Label>
                            <Switch
                                id="notif_bookings"
                                checked={emailBookings}
                                onCheckedChange={setEmailBookings}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="notif_fleet" className="flex flex-col space-y-1">
                                <span className="text-sm font-bold text-[#0A1F1C] dark:text-white">Alertas do Sistema</span>
                                <span className="font-normal text-[10px] text-[#0A1F1C]/60 dark:text-white/60">Manutenções e avisos da frota.</span>
                            </Label>
                            <Switch
                                id="notif_fleet"
                                checked={systemAlerts}
                                onCheckedChange={setSystemAlerts}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="notif_marketing" className="flex flex-col space-y-1">
                                <span className="text-sm font-bold text-[#0A1F1C] dark:text-white">Marketing & Dicas</span>
                                <span className="font-normal text-[10px] text-[#0A1F1C]/60 dark:text-white/60">Novidades sobre a plataforma GreenBreeze.</span>
                            </Label>
                            <Switch
                                id="notif_marketing"
                                checked={marketing}
                                onCheckedChange={setMarketing}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-8 flex items-center gap-3 sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Guardar Preferências
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Security Dialog
export function SecurityDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const { updateUserPasswordAction } = await import("@/app/actions/auth");
        const result = await updateUserPasswordAction(formData);

        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Palavra-passe atualizada com sucesso!");
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl dark:bg-black/80 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C] dark:text-white">Segurança</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 dark:text-white/60 text-xs">
                        Atualize a sua palavra-passe de acesso ao Backoffice.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_pwd" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Palavra-passe Atual</Label>
                            <Input id="current_pwd" name="current_pwd" type="password" placeholder="••••••••" required className="rounded-xl border-white/50 bg-white/50 focus:bg-white dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_pwd" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Nova Palavra-passe</Label>
                            <Input id="new_pwd" name="new_pwd" type="password" placeholder="••••••••" required className="rounded-xl border-white/50 bg-white/50 focus:bg-white dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_pwd" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Confirmar Nova Palavra-passe</Label>
                            <Input id="confirm_pwd" name="confirm_pwd" type="password" placeholder="••••••••" required className="rounded-xl border-white/50 bg-white/50 focus:bg-white dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                    </div>
                    <DialogFooter className="mt-8 flex items-center gap-3 sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Atualizar Segurança
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Appearance Dialog
export function AppearanceDialog({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme();

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl dark:bg-black/80 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C] dark:text-white">Personalização Emerald Glass</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 dark:text-white/60 text-xs">
                        Configure a aparência do interface administrativo.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Esquema de Cores</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setTheme("emerald")}
                                className={`group h-24 rounded-2xl border-2 hover:bg-[#44C3B2] hover:text-[#0A1F1C] dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C] hover:border-[#44C3B2] bg-white dark:bg-white/5 flex flex-col items-center justify-center gap-2 transition-all ${theme === 'emerald' ? 'border-[#44C3B2]' : 'border-transparent dark:border-white/10'}`}
                            >
                                <div className="h-6 w-6 rounded-full bg-[#0A1F1C] border-2 border-[#44C3B2]"></div>
                                <span className={`font-bold text-xs group-hover:text-[#0A1F1C] ${theme === 'emerald' ? 'text-[#0A1F1C] dark:text-white' : 'text-[#0A1F1C]/70 dark:text-white/70'}`}>Emerald</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setTheme("dark")}
                                className={`group h-24 rounded-2xl border-2 hover:bg-[#44C3B2] hover:text-[#0A1F1C] dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C] hover:border-[#44C3B2] bg-[#0A1F1C] flex flex-col items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'border-[#44C3B2]' : 'border-transparent'}`}
                            >
                                <div className="h-6 w-6 rounded-full bg-white border-2 border-[#44C3B2]"></div>
                                <span className={`font-bold text-xs group-hover:text-[#0A1F1C] ${theme === 'dark' ? 'text-white' : 'text-white/70'}`}>Escuro</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Backup Dialog
export function BackupDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const { exportReservationsCSVAction } = await import("@/app/actions/backup");
            const result = await exportReservationsCSVAction();

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.csv) {
                const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const date = new Date().toISOString().split('T')[0];
                link.setAttribute("download", `greenbreeze-export-${date}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success("Download do relatório CSV iniciado com sucesso!");
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Ocorreu um erro ao gerar o ficheiro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-white/50 bg-white/80 backdrop-blur-2xl dark:bg-black/80 dark:border-white/10">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C] dark:text-white">Dados & Backup</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 dark:text-white/60 text-xs">
                        Exporte as reservas, relatórios financeiros e registos em formato CSV.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="rounded-2xl border border-white/50 bg-[#0A1F1C]/5 p-4 text-center dark:bg-white/5 dark:border-white/10 flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-white dark:bg-black flex items-center justify-center shadow-sm">
                            <Download className="h-5 w-5 text-[#44C3B2]" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-[#0A1F1C] dark:text-white">Relatório Completo</p>
                            <p className="text-[10px] text-[#0A1F1C]/60 dark:text-white/60">Gera um ficheiro CSV com todo o histórico de reservas, valores e dados de clientes da Marina.</p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-8 flex items-center gap-3 sm:justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                    <Button onClick={handleExport} disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                        Transferir Ficheiro
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// General Settings Dialog
export function GeneralSettingsDialog({
    children,
    initialSettings
}: {
    children: React.ReactNode,
    initialSettings?: any
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const { updateSystemSettingsAction } = await import("@/app/actions/settings");

        const payload = {
            marina_name: formData.get("marina_name") as string,
            language: formData.get("language") as string,
            timezone: formData.get("timezone") as string,
        };

        const result = await updateSystemSettingsAction(payload);

        setLoading(false);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Definições guardadas com sucesso!");
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[460px] rounded-[32px] border-white/50 bg-[#E8EAE6] p-8 pb-8 !pt-10 dark:bg-black/90 dark:border-white/10">
                <DialogHeader className="mb-6 space-y-1">
                    <DialogTitle className="font-heading text-4xl text-[#0A1F1C] dark:text-white">Definições da Marina</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60 text-[13px] dark:text-white/60">
                        Informações bases sobre a operação da empresa.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave}>
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="marina_name" className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Nome da Marina</Label>
                            <Input id="marina_name" name="marina_name" defaultValue={initialSettings?.marina_name || "GreenBreeze Tróia"} className="h-12 rounded-2xl border-2 border-[#44C3B2] bg-white px-4 text-[#0A1F1C] font-medium focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-black/50 dark:border-white/10 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Idioma</Label>
                                <Select name="language" defaultValue={initialSettings?.language || "pt"}>
                                    <SelectTrigger className="h-12 rounded-2xl border-none bg-white/50 px-4 text-[#0A1F1C] font-medium focus:ring-0 dark:bg-black/50 dark:text-white">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl dark:bg-black/90 dark:border-white/10">
                                        <SelectItem value="pt">Português (PT)</SelectItem>
                                        <SelectItem value="en">English (EN)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50 dark:text-white/50">Fuso Horário</Label>
                                <Select name="timezone" defaultValue={initialSettings?.timezone || "lisbon"}>
                                    <SelectTrigger className="h-12 rounded-2xl border-none bg-white/50 px-4 text-[#0A1F1C] font-medium focus:ring-0 dark:bg-black/50 dark:text-white">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/50 bg-white/90 backdrop-blur-xl dark:bg-black/90 dark:border-white/10">
                                        <SelectItem value="lisbon">Lisboa (WET)</SelectItem>
                                        <SelectItem value="london">Londres (GMT)</SelectItem>
                                        <SelectItem value="madrid">Madrid (CET)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-8 flex items-center gap-3 sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-12 rounded-2xl border-none bg-white/40 px-6 font-bold text-[#0A1F1C] hover:bg-[#44C3B2] hover:text-[#0A1F1C] transition-all dark:bg-white/10 dark:text-white dark:hover:bg-[#44C3B2] dark:hover:text-[#0A1F1C]">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-[#0A1F1C] px-6 text-[#44C3B2] hover:bg-[#0A1F1C]/80 font-bold transition-all">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Guardar Definições
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
