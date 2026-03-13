"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function TimelineMap({ reservations, fleet }: { reservations: any[], fleet: any[] }) {
    const [date, setDate] = useState<Date>(new Date());

    const formattedDate = format(date, "yyyy-MM-dd");

    // Filter reservations for the selected date
    const dailyReservations = reservations.filter(r => r.date === formattedDate && r.status !== 'Cancelado');

    const startHour = 8;
    const endHour = 20;
    const totalHours = endHour - startHour;
    const hours = Array.from({ length: totalHours + 1 }, (_, i) => i + startHour); // 8:00 to 20:00

    const parseTime = (timeStr: string) => {
        const [h, m] = timeStr.trim().split(":").map(Number);
        return (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
    };

    const getResStyle = (res: any, index: number, allBoatRes: any[]) => {
        try {
            const timeStr = res.time || "";
            const parts = timeStr.split("-").map((s: string) => s.trim());
            let start = 8;
            let duration = 2; // default 2 hours

            const timeLower = timeStr.toLowerCase();

            if (parts.length === 2 && !isNaN(parseTime(parts[0])) && !isNaN(parseTime(parts[1]))) {
                start = parseTime(parts[0]);
                const end = parseTime(parts[1]);
                duration = Math.max(0.5, end - start);
            } else if (parts.length === 1 && !isNaN(parseTime(parts[0])) && parts[0].includes(":")) {
                start = parseTime(parts[0]);
            } else {
                // Heuristics for generic string times
                if (timeLower.includes("dia todo") || timeLower.includes("8h") || timeLower.includes("1 dia")) {
                    start = 10;
                    duration = 8;
                } else if (timeLower.includes("sunset") || timeLower.includes("sun-set")) {
                    start = 17;
                    duration = 3;
                } else if (timeLower.includes("1/2 dia") || timeLower.includes("meio dia")) {
                    const isSecond = allBoatRes.findIndex(r => r.id === res.id) > 0;
                    start = isSecond ? 14 : 9; // Morning vs Afternoon
                    duration = 4;
                } else {
                    start = 9 + (index * 4);
                    if (timeLower.includes("3h")) duration = 3;
                    if (timeLower.includes("2h")) duration = 2;
                    if (timeLower.includes("4h")) duration = 4;
                    if (timeLower.includes("6h")) duration = 6;
                }
            }

            // Bound checks
            const startOffset = Math.max(0, start - startHour);
            let leftPerc = (startOffset / totalHours) * 100;
            let widthPerc = (duration / totalHours) * 100;

            // Cap if extending beyond visual map
            if (leftPerc + widthPerc > 100) {
                widthPerc = 100 - leftPerc;
            }

            return {
                left: `calc(200px + ${leftPerc}%)`,
                width: `calc(${widthPerc}% - 8px)`, // -8px for margin/gap
            };
        } catch {
            return { display: "none" };
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2 bg-card p-1 rounded-md border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, -1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"ghost"}
                                className={cn(
                                    "w-[220px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#44C3B2]"></div>
                        <span className="text-muted-foreground">Confirmado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                        <span className="text-muted-foreground">Pendente</span>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card shadow-sm overflow-x-auto">
                <div className="min-w-[900px]">
                    {/* Header Row */}
                    <div className="flex relative items-center border-b border-border/60 bg-muted/30">
                        <div className="w-[200px] flex-shrink-0 py-3 pl-4 font-semibold text-sm text-foreground">
                            Frota
                        </div>
                        <div className="flex-1 flex relative h-full">
                            {hours.slice(0, -1).map((hour, i) => (
                                <div key={hour} className="flex-1 border-l border-border/40 py-3 text-xs text-muted-foreground pl-1 relative">
                                    <span className="absolute top-1/2 -translate-y-1/2 -left-3 bg-card px-1">{hour}:00</span>
                                    {i === hours.length - 2 && (
                                        <span className="absolute top-1/2 -translate-y-1/2 -right-3 bg-card px-1">{endHour}:00</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fleet Rows */}
                    <div className="divide-y divide-border/60">
                        {fleet.map((boat) => {
                            const boatReservations = dailyReservations.filter(r => r.boat_id === boat.id);

                            return (
                                <div key={boat.id} className="flex relative min-h-[80px] hover:bg-muted/10 transition-colors">
                                    {/* Boat Name Column */}
                                    <div className="w-[200px] flex-shrink-0 py-4 pl-4 font-medium text-sm flex flex-col justify-center border-r border-border/40 bg-card z-10">
                                        <div className="font-semibold text-foreground">{boat.name}</div>
                                        <div className="text-xs text-muted-foreground">{boat.capacity} px</div>
                                    </div>

                                    {/* Grid background lines */}
                                    <div className="flex-1 flex pointer-events-none relative">
                                        {hours.slice(0, -1).map((hour) => (
                                            <div key={`bg-${hour}`} className="flex-1 border-r border-border/20 border-dashed"></div>
                                        ))}
                                    </div>

                                    {/* Reservations */}
                                    {boatReservations.map((res, index) => (
                                        <div
                                            key={res.id}
                                            className={cn(
                                                "absolute top-2 bottom-2 rounded-md border shadow-sm flex flex-col justify-center px-3 overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] z-20",
                                                res.status === 'Confirmado' ? "bg-[#44C3B2]/10 border-[#44C3B2]/30" : "bg-[#D4AF37]/10 border-[#D4AF37]/30"
                                            )}
                                            style={getResStyle(res, index, boatReservations)}
                                            title={`${res.client_name} - ${res.time} (${res.status})`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    res.status === 'Confirmado' ? "bg-[#44C3B2]" : "bg-[#D4AF37]"
                                                )}></div>
                                                <span className="font-semibold text-sm truncate text-foreground">{res.client_name}</span>
                                            </div>
                                            <div className="flex items-center mt-1 text-xs text-muted-foreground opacity-90 truncate">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {res.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {dailyReservations.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border rounded-md border-dashed bg-muted/20">
                    Não existem reservas marcadas para este dia.
                </div>
            )}
        </div>
    );
}
