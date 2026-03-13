import { Metadata } from "next";
import { getTeamMembers } from "@/app/actions/team";
import { getProfiles } from "@/app/actions/users";
import { AddMemberDialog } from "@/components/team/add-member-dialog";
import { TeamActionsCell } from "@/components/team/team-actions-cell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anchor, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";

export const metadata: Metadata = {
    title: "Equipa | GreenBreeze Admin",
    description: "Gestão da equipa de skippers e marinheiros.",
};

export default async function TeamPage() {
    const { user } = await getUserProfile();
    if (user?.role !== "admin") {
        redirect("/");
    }

    const { team, error } = await getTeamMembers();
    const { profiles } = await getProfiles(); // To link login

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 backdrop-blur-xl">
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        );
    }

    const roleConfigs: Record<string, { label: string; color: string; icon: any }> = {
        skipper: { label: "Skipper", color: "bg-[#0A1F1C] text-[#44C3B2]", icon: Anchor },
        marinheiro: { label: "Marinheiro", color: "bg-[#44C3B2]/10 text-[#0A1F1C]", icon: User },
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">A Nossa Equipa</h2>
                    <p className="text-muted-foreground font-body text-sm text-[#0A1F1C]/60">
                        Gerencie os colaboradores disponíveis para as experiências GreenBreeze.
                    </p>
                </div>
                <AddMemberDialog profiles={profiles} />
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all overflow-hidden">
                <CardHeader className="bg-white/40 border-b border-white/50 py-6">
                    <CardTitle className="font-heading text-xl text-[#0A1F1C]">Listagem Completa</CardTitle>
                    <CardDescription className="font-body text-[#0A1F1C]/60 text-xs">Total de {team?.length || 0} colaboradores ativos.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#0A1F1C]/5 bg-white/20">
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40">Nome</th>
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40">Função</th>
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40">Login Associado</th>
                                    <th className="px-6 py-4 font-heading text-xs uppercase tracking-widest text-[#0A1F1C]/40 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0A1F1C]/5">
                                {team?.map((member: any) => {
                                    const config = roleConfigs[member.role] || roleConfigs.skipper;
                                    const Icon = config.icon;

                                    return (
                                        <tr key={member.id} className="group hover:bg-white/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-white/50 flex items-center justify-center text-[#0A1F1C] font-bold border border-[#0A1F1C]/5">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-[#0A1F1C]">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`rounded-lg px-2 py-0.5 border-none font-bold uppercase text-[10px] gap-1.5 ${config.color}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {member.profile ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-[#44C3B2] font-semibold">
                                                        <div className="h-2 w-2 rounded-full bg-[#44C3B2] animate-pulse" />
                                                        {member.profile.full_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-[#0A1F1C]/30 uppercase tracking-tighter">Sem Acesso Direto</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <TeamActionsCell member={member} profiles={profiles} />
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
