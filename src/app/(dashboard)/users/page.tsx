import { Metadata } from "next";
import { getProfiles } from "@/app/actions/users";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UserActionsCell } from "@/components/users/user-actions-cell";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Calendar, ShieldAlert, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export const metadata: Metadata = {
    title: "Utilizadores | GreenBreeze Admin",
    description: "Gestão de utilizadores e cargos administrativos.",
};

export default async function UsersPage() {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        redirect("/");
    }

    const { profiles, error } = await getProfiles();

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur-xl">
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        );
    }

    const roleConfigs: Record<string, { label: string; color: string; icon: any }> = {
        admin: { label: "Administrador", color: "bg-[#0A1F1C] text-[#44C3B2]", icon: Shield },
        booking_manager: { label: "Gestor", color: "bg-blue-100 text-blue-700", icon: Shield },
        skipper: { label: "Skipper", color: "bg-amber-100 text-amber-700", icon: Shield },
        marinheiro: { label: "Marinheiro", color: "bg-teal-100 text-teal-700", icon: Shield },
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Utilizadores</h2>
                    <p className="text-muted-foreground font-body text-sm text-[#0A1F1C]/60">
                        Gerencie os acessos e permissões da equipa administrativa.
                    </p>
                </div>
                <AddUserDialog />
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all overflow-hidden">
                <CardHeader className="bg-white/40 border-b border-white/50 py-6">
                    <CardTitle className="font-heading text-xl text-[#0A1F1C]">Lista de Acessos</CardTitle>
                    <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Utilizadores com permissão de entrada no backoffice.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#0A1F1C]/5 bg-white/20">
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40">Utilizador</th>
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40">Cargo</th>
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40">Data de Registo</th>
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40 w-[80px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0A1F1C]/5">
                                {profiles?.map((profile: any) => {
                                    const config = roleConfigs[profile.role] || roleConfigs.skipper;
                                    const Icon = config.icon;

                                    return (
                                        <tr key={profile.id} className="group hover:bg-white/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[#0A1F1C] flex items-center justify-center text-[#44C3B2] font-bold shadow-lg shadow-[#0A1F1C]/10 border border-white/20 uppercase">
                                                        {profile.full_name?.charAt(0) || "U"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[#0A1F1C]">{profile.full_name}</span>
                                                        <span className="text-xs text-[#0A1F1C]/60 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {/* User email would usually be here but requires Auth join or metadata sync */}
                                                            {profile.id === "123" ? "ADMIN ACCOUNT" : "Utilizador Ativo"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`rounded-lg px-2 py-0.5 border-none font-bold uppercase text-[10px] gap-1.5 ${config.color}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-[#0A1F1C]/60">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(profile.created_at), "d 'de' MMMM, yyyy", { locale: pt })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <UserActionsCell
                                                    userId={profile.id}
                                                    currentRole={profile.role}
                                                    email={profile.id === "SYSTEM_ID" ? "info@greenbreeze.pt" : ""} // Logic for protected main admin
                                                    fullName={profile.full_name || "Utilizador Desconhecido"}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
