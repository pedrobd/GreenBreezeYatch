"use client";

import { useEffect, useState } from "react";
import { Clock as ClockIcon } from "lucide-react";

export function Clock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    return (
        <div className="flex flex-col items-end transition-all duration-300 group/clock">
            <div className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-[#44C3B2] shrink-0" />
                <span className="text-xs font-bold text-[#0A1F1C] opacity-40 leading-none tabular-nums tracking-[0.2em]">
                    {time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>
            <span className="text-[10px] font-bold text-[#44C3B2] uppercase tracking-wider mt-1 whitespace-nowrap">
                {time.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}
            </span>
        </div>
    );
}
