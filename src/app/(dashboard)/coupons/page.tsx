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
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { getCouponsAction } from "@/app/actions/coupons";
import { AddCouponDialog } from "@/components/coupons/add-coupon-dialog";
import { CouponActionsCell } from "@/components/coupons/coupon-actions-cell";
import { Tag, Calendar, Ship, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Cupons | GreenBreeze Admin",
    description: "Gestão de Cupons de Desconto GreenBreeze",
};

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
    const { data: coupons, error } = await getCouponsAction();
    
    const supabase = await createClient();
    const { data: fleet } = await supabase
        .from('fleet')
        .select('id, name')
        .order('name');

    if (error) {
        console.error("Error fetching coupons:", error);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-[#0A1F1C] font-heading">Cupons</h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Gerencie códigos de desconto, datas de validade e restrições por barco.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AddCouponDialog fleet={fleet || []} />
                </div>
            </div>

            <Card className="rounded-3xl border-white/50 bg-white/40 shadow-2xl shadow-black/5 backdrop-blur-xl overflow-hidden border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#0A1F1C]/5">
                            <TableRow className="hover:bg-transparent border-white/20">
                                <TableHead className="w-[150px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Código</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Desconto</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Aplicável a</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Validade</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8 text-center">Estado</TableHead>
                                <TableHead className="w-[80px] py-6 px-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-body">
                                        Nenhum cupão encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {coupons?.map((coupon: any) => {
                                const isActive = coupon.is_active && 
                                    (new Date() >= new Date(coupon.start_date)) && 
                                    (new Date() <= new Date(coupon.end_date));
                                
                                return (
                                    <TableRow key={coupon.id} className="group hover:bg-white/30 border-white/10 transition-colors">
                                        <TableCell className="py-4 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#0A1F1C]/5 rounded-xl text-[#0A1F1C]/40">
                                                    <Tag className="h-4 w-4" />
                                                </div>
                                                <span className="font-black text-[#0A1F1C] text-sm tracking-wider uppercase">{coupon.code}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-8">
                                            <div className="flex items-center gap-1 font-bold text-[#44C3B2] text-lg">
                                                <span>{coupon.discount_percentage}</span>
                                                <Percent className="h-3 w-3" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-8">
                                            <div className="flex flex-col gap-1">
                                                {!coupon.boat_ids || coupon.boat_ids.length === 0 ? (
                                                    <Badge variant="outline" className="w-fit bg-blue-500/5 text-blue-500 border-blue-500/20 text-[10px] font-bold py-0 h-5">Todos os Barcos</Badge>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {coupon.boat_ids.map((bId: string) => (
                                                            <Badge key={bId} variant="outline" className="bg-[#0A1F1C]/5 text-[#0A1F1C]/60 text-[9px] font-bold py-0 h-5">
                                                                {fleet?.find(f => f.id === bId)?.name || "Barco Desconhecido"}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-8 font-medium text-[#0A1F1C]/70 text-xs">
                                            <div className="flex flex-col">
                                                <span>Desde: {new Date(coupon.start_date).toLocaleDateString('pt-PT')}</span>
                                                <span>Até: {new Date(coupon.end_date).toLocaleDateString('pt-PT')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-8 text-center">
                                            <Badge
                                                className={cn(
                                                    "border-none h-6 px-3 text-[10px] font-black uppercase tracking-widest",
                                                    isActive ? "bg-[#44C3B2]/10 text-[#44C3B2]" : "bg-red-500/10 text-red-500"
                                                )}
                                                variant="outline"
                                            >
                                                {isActive ? "Ativo" : (!coupon.is_active ? "Inativo" : "Fora de Data")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-8">
                                            <CouponActionsCell coupon={coupon} fleet={fleet || []} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
