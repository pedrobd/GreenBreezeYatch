"use client";

import { useState } from "react";
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditReservationDialog } from "@/components/reservations/edit-reservation-dialog";

interface MonthlyMapProps {
    reservations: any[];
    fleet: any[];
    team?: any[];
    rates?: any[];
    availableFood?: any[];
    bookedDates?: string[];
}

export function MonthlyMap({ 
    reservations, 
    fleet,
    team = [],
    rates = [],
    availableFood = [],
    bookedDates = []
}: MonthlyMapProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleReservationClick = (res: any) => {
        setSelectedReservation(res);
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-[#0A1F1C] capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                    <div className="flex items-center bg-white/40 border border-white/50 backdrop-blur-xl rounded-xl p-1">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:bg-[#0A1F1C] hover:text-[#44C3B2] rounded-lg">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" className="px-4 font-bold text-xs uppercase tracking-wider hover:bg-[#0A1F1C] hover:text-[#44C3B2] rounded-lg" onClick={() => setCurrentMonth(new Date())}>
                            Hoje
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="hover:bg-[#0A1F1C] hover:text-[#44C3B2] rounded-lg">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#44C3B2]" /> Confirmado
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#D4AF37]" /> Pendente
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-[#0A1F1C]/5 border border-[#0A1F1C]/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Weekday Headers */}
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
                    <div key={day} className="bg-white/40 p-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-[#0A1F1C]/40 border-b border-[#0A1F1C]/10">
                        {day}
                    </div>
                ))}

                {calendarDays.map((day, idx) => {
                    const dayReservations = reservations.filter(r => isSameDay(new Date(r.date), day) && r.status !== 'Cancelado');
                    const isOutsideMonth = !isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div 
                            key={day.toString()} 
                            className={cn(
                                "min-h-[140px] bg-white/40 p-2 transition-all hover:bg-white/60 group",
                                isOutsideMonth && "opacity-30 grayscale",
                                idx % 7 === 6 && "border-r-0"
                            )}
                        >
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className={cn(
                                    "text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                                    isToday ? "bg-[#0A1F1C] text-[#44C3B2] shadow-lg" : "text-[#0A1F1C]/40"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {dayReservations.length > 0 && (
                                    <span className="text-[9px] font-black text-[#44C3B2] opacity-0 group-hover:opacity-100 transition-opacity">
                                        {dayReservations.length} {dayReservations.length === 1 ? 'Reserva' : 'Reservas'}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                {dayReservations.map((res) => (
                                    <div 
                                        key={res.id}
                                        onClick={() => handleReservationClick(res)}
                                        className={cn(
                                            "p-1.5 rounded-lg border text-[10px] cursor-pointer transition-all hover:scale-[1.02] shadow-sm",
                                            res.status === 'Confirmado' 
                                                ? "bg-[#44C3B2]/10 border-[#44C3B2]/30 text-[#0A1F1C]/80" 
                                                : "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#0A1F1C]/80"
                                        )}
                                    >
                                        <div className="font-bold truncate flex items-center gap-1">
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                res.status === 'Confirmado' ? "bg-[#44C3B2]" : "bg-[#D4AF37]"
                                            )} />
                                            {res.client_name}
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5 opacity-60">
                                            <div className="flex items-center gap-0.5 font-bold">
                                                <Clock className="w-2 h-2" />
                                                {res.time?.split('-')[0] || "??:??"}
                                            </div>
                                            <div className="font-black text-[8px] uppercase">{res.fleet?.name?.split(' ')[0]}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Dialog Integration */}
            {selectedReservation && (
                <EditReservationDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    reservation={selectedReservation}
                    fleet={fleet}
                    team={team}
                    rates={rates}
                    availableFood={availableFood}
                    bookedDates={bookedDates}
                />
            )}
        </div>
    );
}
