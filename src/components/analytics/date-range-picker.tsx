"use client";

import * as React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getReservationDatesAction } from "@/app/actions/reservations";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize from URL params or default to last 30 days
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Default: Last 30 days
    const defaultTo = new Date();
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: fromParam ? new Date(fromParam) : defaultFrom,
        to: toParam ? new Date(toParam) : defaultTo,
    });

    const [bookedDates, setBookedDates] = React.useState<Date[]>([]);

    React.useEffect(() => {
        getReservationDatesAction().then((result) => {
            if (result.data) {
                setBookedDates(result.data.map((d: string) => new Date(d)));
            }
        });
    }, []);

    const handleSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);

        const params = new URLSearchParams(searchParams);
        if (newDate?.from) {
            params.set('from', format(newDate.from, 'yyyy-MM-dd'));
        } else {
            params.delete('from');
        }

        if (newDate?.to) {
            params.set('to', format(newDate.to, 'yyyy-MM-dd'));
        } else {
            params.delete('to');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal rounded-2xl bg-white/50 border-white/50 backdrop-blur-md hover:bg-white/80 transition-all font-body text-[#0A1F1C]",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd LLL, y", { locale: pt })} -{" "}
                                    {format(date.to, "dd LLL, y", { locale: pt })}
                                </>
                            ) : (
                                format(date.from, "dd LLL, y", { locale: pt })
                            )
                        ) : (
                            <span>Selecionar datas</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-white/80 shadow-2xl" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                        modifiers={{ booked: bookedDates }}
                        locale={pt}
                        className="bg-white"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
