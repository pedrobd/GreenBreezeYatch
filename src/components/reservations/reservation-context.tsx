"use client";

import { createContext, useContext, useTransition, ReactNode, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface ReservationContextType {
    isNavigating: boolean;
    navigate: (action: () => void) => void;
}

const ReservationContext = createContext<ReservationContextType>({
    isNavigating: false,
    navigate: () => { },
});

export function ReservationProvider({ children }: { children: ReactNode }) {
    const [isPending, startTransition] = useTransition();

    const navigate = useCallback((action: () => void) => {
        startTransition(() => {
            action();
        });
    }, []);

    return (
        <ReservationContext.Provider value={{ isNavigating: isPending, navigate }}>
            {children}
        </ReservationContext.Provider>
    );
}

export function useReservation() {
    return useContext(ReservationContext);
}

export function ReservationLoadingOverlay() {
    const { isNavigating } = useReservation();

    if (!isNavigating) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-3xl transition-all duration-300">
            <Loader2 className="h-16 w-16 text-[#44C3B2] animate-spin drop-shadow-xl" />
        </div>
    );
}
